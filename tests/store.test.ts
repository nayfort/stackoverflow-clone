import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/lib/store';
import { AppError } from '../src/lib/types';
import { parseFilters } from '../src/lib/filters';
import { validatePost } from '../src/lib/validation';
import { validateCredentials } from '../src/lib/auth-validation';
import { hashPassword, verifyPassword } from '../src/lib/password';
const question = {
  title: 'How can I share state in React?',
  body: 'I have two sibling components and need them to share a selected item.',
  tags: 'react, typescript',
};
const answer = {
  body: 'Lift the selected item into the closest common parent and pass it through props.',
};
const code = (value: string) => (error: unknown) =>
  error instanceof AppError && error.code === value;
function setup() {
  const store = new Store(':memory:');
  const alice = store.createUser('alice', 'alice@example.test', 'hash');
  const bob = store.createUser('bob', 'bob@example.test', 'hash');
  return { store, alice, bob };
}

test('posts, replies, votes and sessions survive reopening the database', () => {
  const directory = mkdtempSync(join(tmpdir(), 'community-test-'));
  const path = join(directory, 'test.sqlite');
  let store = new Store(path);
  try {
    const alice = store.createUser('alice', 'alice@example.test', 'hash');
    const bob = store.createUser('bob', 'bob@example.test', 'hash');
    const id = store.create(alice.id, question);
    const reply = store.create(bob.id, answer, id);
    store.vote(id, bob.id, 1);
    store.accept(reply, alice.id);
    store.createSession('hashed-session', alice.id);
    store.close();
    store = new Store(path);
    const data = store.detail(id, alice.id)!;
    assert.equal(data.title, question.title);
    assert.equal(data.votes, 1);
    assert.equal(data.answers[0].body, answer.body);
    assert.equal(data.solved, true);
    assert.equal(store.session('hashed-session')?.id, alice.id);
    assert.equal(store.detail(id, bob.id)?.myVote, 1);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test('server ownership, unauthenticated access and self votes are enforced', () => {
  const { store, alice, bob } = setup();
  try {
    assert.throws(() => store.create('', question), code('auth'));
    const id = store.create(alice.id, { ...question, author: 'spoofed' });
    assert.equal(store.detail(id)?.author, 'alice');
    assert.throws(() => store.update(id, bob.id, question), code('forbidden'));
    assert.throws(() => store.remove(id, bob.id), code('forbidden'));
    assert.throws(() => store.vote(id, alice.id, 1), code('selfVote'));
    assert.throws(() => store.vote(id, bob.id, 2), code('invalid'));
    const reply = store.create(bob.id, answer, id);
    assert.throws(() => store.accept(reply, bob.id), code('forbidden'));
    assert.throws(() => store.create(bob.id, answer, reply), code('invalid'));
    assert.equal(store.detail(id, bob.id)?.isOwner, false);
  } finally {
    store.close();
  }
});
test('voting toggles and switches, only one answer is accepted, deletion cascades', () => {
  const { store, alice, bob } = setup();
  try {
    const id = store.create(alice.id, question);
    store.vote(id, bob.id, 1);
    assert.equal(store.detail(id)?.votes, 1);
    store.vote(id, bob.id, 1);
    assert.equal(store.detail(id)?.votes, 0);
    store.vote(id, bob.id, 1);
    store.vote(id, bob.id, -1);
    assert.equal(store.detail(id)?.votes, -1);
    const first = store.create(bob.id, answer, id),
      second = store.create(bob.id, answer, id);
    store.accept(first, alice.id);
    store.accept(second, alice.id);
    assert.equal(store.detail(id)?.answers.filter((a) => a.accepted).length, 1);
    assert.equal(store.detail(id)?.answers[0].id, second);
    store.accept(second, alice.id);
    assert.equal(store.detail(id)?.solved, false);
    store.accept(first, alice.id);
    store.remove(first, bob.id);
    assert.equal(store.detail(id)?.solved, false);
    store.vote(second, alice.id, 1);
    store.remove(id, alice.id);
    assert.equal(store.detail(id), null);
    assert.equal((store.db.prepare('SELECT COUNT(*) AS n FROM votes').get() as { n: number }).n, 0);
    assert.equal((store.db.prepare('SELECT COUNT(*) AS n FROM posts').get() as { n: number }).n, 0);
  } finally {
    store.close();
  }
});
test('search, Ukrainian case folding, tags, pagination and filters return real data', () => {
  const { store, alice, bob } = setup();
  try {
    for (let i = 0; i < 14; i++)
      store.create(alice.id, { ...question, title: `Питання про React ${i}`, tags: 'react' });
    const other = store.create(bob.id, {
      ...question,
      title: 'A question about SQL wildcards %_',
      tags: 'sql',
    });
    store.create(alice.id, answer, other);
    store.vote(other, alice.id, 1);
    assert.equal(store.list(parseFilters({ q: 'ПИТАННЯ' })).total, 14);
    assert.equal(store.list(parseFilters({ q: '%_' })).total, 1);
    assert.equal(store.list(parseFilters({ tag: 'react' })).total, 14);
    assert.equal(store.list(parseFilters({ mine: '1' }), bob.id).total, 1);
    assert.equal(store.list(parseFilters({ sort: 'unanswered' })).total, 14);
    assert.equal(store.list(parseFilters({ sort: 'popular' })).questions[0].id, other);
    assert.equal(store.list(parseFilters({ page: '2' })).questions.length, 3);
    assert.equal(store.list(parseFilters({ q: "' OR 1=1 --" })).total, 0);
    store.update(other, bob.id, { ...question, title: 'An updated title about databases' });
    assert.equal(store.list(parseFilters({ q: 'updated title' })).total, 1);
  } finally {
    store.close();
  }
});
test('expired and revoked sessions do not authenticate; profiles never expose credentials', () => {
  const { store, alice } = setup();
  try {
    store.createSession('first', alice.id);
    assert.equal(store.session('first')?.username, 'alice');
    store.db.prepare('UPDATE sessions SET expires_at=0 WHERE id=?').run('first');
    assert.equal(store.session('first'), null);
    store.createSession('second', alice.id);
    store.deleteSession('second');
    assert.equal(store.session('second'), null);
    assert.equal(store.session('invented'), null);
    const profile = store.profile(alice.id)!;
    assert.equal('email' in profile, false);
    assert.equal('password' in profile, false);
    assert.throws(() => store.createUser('ALICE', 'new@example.test', 'hash'), code('duplicate'));
  } finally {
    store.close();
  }
});
test('validation rejects invalid lengths, tag payloads and credentials', () => {
  assert.throws(
    () => validatePost({ ...question, author: 'ok', title: '   ' }, true),
    code('title'),
  );
  assert.throws(
    () => validatePost({ ...question, author: 'ok', body: 'x'.repeat(10001) }, true),
    code('body'),
  );
  assert.throws(
    () => validatePost({ ...question, author: 'ok', tags: '<script>' }, true),
    code('tags'),
  );
  assert.throws(
    () => validatePost({ ...question, author: 'ok', tags: 'a,b,c,d,e,f' }, true),
    code('tags'),
  );
  assert.deepEqual(validatePost({ ...question, author: 'ok', tags: 'React, react' }, true).tags, [
    'react',
  ]);
  assert.throws(() => validateCredentials('broken', 'valid password'), code('email'));
  assert.throws(() => validateCredentials('a@b.test', 'short'), code('password'));
  assert.throws(
    () => validateCredentials('a@b.test', 'valid password', 'has spaces'),
    code('username'),
  );
});
test('passwords use unique salts and wrong passwords never authenticate', async () => {
  const password = 'A unique test password 123!';
  const one = await hashPassword(password),
    two = await hashPassword(password);
  assert.notEqual(one, two);
  assert.equal(one.includes(password), false);
  assert.equal(await verifyPassword(password, one), true);
  assert.equal(await verifyPassword('wrong password', one), false);
  assert.equal(await verifyPassword(password, ''), false);
});
test('rate limiting blocks excess operations', () => {
  const { store, alice } = setup();
  try {
    store.consumeLimit(alice.id, 'test', 2);
    store.consumeLimit(alice.id, 'test', 2);
    assert.throws(() => store.consumeLimit(alice.id, 'test', 2), code('rateLimit'));
  } finally {
    store.close();
  }
});
