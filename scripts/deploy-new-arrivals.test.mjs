import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMigrationHistory } from './deploy-new-arrivals.mjs';
const known = [
  {name:'previous-one',checksums:['a','a-crlf']},
  {name:'previous-two',checksums:['b']},
  {name:'new-arrival',checksums:['c']},
];
const row=(name,checksum)=>({migration_name:name,checksum,finished:true,rolled_back:false});
const baseline=[row('previous-one','a'),row('previous-two','b')];
const column={data_type:'boolean',is_nullable:'NO',column_default:'false'};
test('allows only the one expected pending migration',()=>assert.equal(validateMigrationHistory(baseline,[],known),'apply'));
test('accepts recorded CRLF checksum without rewriting history',()=>assert.equal(validateMigrationHistory([row('previous-one','a-crlf'),baseline[1]],[],known),'apply'));
test('recognizes the already-applied migration',()=>assert.equal(validateMigrationHistory([...baseline,row('new-arrival','c')],[column],known),'already-applied'));
test('rejects missing baseline history',()=>assert.throws(()=>validateMigrationHistory([],[],known),/baseline/));
test('rejects unknown migrations',()=>assert.throws(()=>validateMigrationHistory([...baseline,row('unexpected','d')],[],known),/unknown/));
test('rejects checksum mismatch',()=>assert.throws(()=>validateMigrationHistory([row('previous-one','wrong'),baseline[1]],[],known),/checksum/));
test('rejects unfinished migrations',()=>assert.throws(()=>validateMigrationHistory([...baseline,{...row('new-arrival','c'),finished:false}],[],known),/unfinished/));
test('rejects a column without its migration record',()=>assert.throws(()=>validateMigrationHistory(baseline,[column],known),/untracked/));
test('rejects recorded migration with incorrect column definition',()=>assert.throws(()=>validateMigrationHistory([...baseline,row('new-arrival','c')],[{...column,is_nullable:'YES'}],known),/column/));
