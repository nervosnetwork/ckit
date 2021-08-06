/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { predefined, ScriptConfig } from '@ckb-lumos/config-manager';
import { CHAIN_SPECS } from '@lay2/pw-core';
import { CkitConfig } from '../providers/CkitProvider';

function toScriptConfig(obj: typeof CHAIN_SPECS.Aggron.pwLock): ScriptConfig {
  return {
    CODE_HASH: obj.script.codeHash,
    HASH_TYPE: obj.script.hashType,
    DEP_TYPE: obj.cellDep.depType,
    TX_HASH: obj.cellDep.outPoint.txHash,
    INDEX: obj.cellDep.outPoint.index,
  };
}

export const SCRIPTS: CkitConfig['SCRIPTS'] = {
  SECP256K1_BLAKE160: predefined.AGGRON4.SCRIPTS.SECP256K1_BLAKE160!,
  ANYONE_CAN_PAY: predefined.AGGRON4.SCRIPTS.ANYONE_CAN_PAY!,
  SUDT: predefined.AGGRON4.SCRIPTS.SUDT!,
  PW_ANYONE_CAN_PAY: toScriptConfig(CHAIN_SPECS.Aggron.pwLock),
  // TODO replace me when deployed
  PW_NON_ANYONE_CAN_PAY: toScriptConfig(CHAIN_SPECS.Aggron.pwLock),
};