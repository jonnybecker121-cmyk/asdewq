import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
const source = readFileSync('www/app.js', 'utf8');
function harness() {
  const values = new Map();
  const localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const ctx = vm.createContext({ localStorage, crypto: webcrypto, TextEncoder, setTimeout });
  vm.runInContext('const ' + source.slice(source.indexOf('Ze = new Set'), source.indexOf('const en =')) + '\nglobalThis.api = { parse: Jt, products: lt, store: Qt(), read: q };', ctx);
  return { ...ctx.api, localStorage, values };
}
test('German speech parses appointments, tasks and shopping lists', () => {
  const app = harness();
  const event = app.parse('Zahnarzt morgen um 15 Uhr', new Date(2026, 9, 26, 10));
  assert.equal(event.kind, 'event');
  assert.equal(event.date.getDate(), 27);
  assert.equal(event.date.getHours(), 15);
  assert.equal(app.parse('Müll rausbringen').kind, 'task');
  assert.ok(app.products('Milch und Brot').includes('Milch'));
  assert.ok(app.products('Milch und Brot').includes('Brot'));
});
test('Local profiles, CRUD, cascade delete and reload preserve data', async () => {
  const { store, read } = harness();
  assert.equal((await store.auth.signUp({ email:'test@local',password:'secret123' })).error, null);
  await store.from('items').insert([{id:'list',kind:'list',title:'Einkauf'},{id:'milk',parent_id:'list',kind:'item',title:'Milch'}]);
  await store.from('items').update({done:true}).eq('id','milk');
  assert.equal(read().data[read().session].find(item=>item.id==='milk').done, true);
  await store.auth.signOut();
  assert.ok((await store.auth.signInWithPassword({email:'test@local',password:'wrong'})).error);
  await store.auth.signInWithPassword({email:'test@local',password:'secret123'});
  assert.equal((await store.from('items').select()).data.length, 2);
  await store.from('items').delete().eq('id','list');
  assert.equal((await store.from('items').select()).data.length, 0);
});
test('Failed writes report an error and leave persisted data intact', async () => {
  const app = harness();
  await app.store.auth.signUp({email:'test@local',password:'secret123'});
  app.localStorage.setItem = () => { throw new Error('QuotaExceeded'); };
  const result = await app.store.from('items').insert({title:'Must not vanish silently'});
  assert.match(result.error.message, /Speichern fehlgeschlagen/);
  assert.deepEqual(Object.values(app.read().data), []);
});
test('Corrupt storage is not silently replaced', () => {
  const app = harness();
  app.values.set('sp_local_v1','broken');
  assert.throws(() => app.read());
  assert.equal(app.values.get('sp_local_v1'),'broken');
});
