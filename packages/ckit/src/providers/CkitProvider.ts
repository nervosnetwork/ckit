import { Address, CellDep, Script, utils } from '@ckb-lumos/base';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import { ProviderConfig } from '@ckit/base';
import { MercuryProvider } from './mercury/MercuryProvider';

export interface CkitConfig extends ProviderConfig {
  SCRIPTS: {
    SECP256K1_BLAKE160: ScriptConfig;
    ANYONE_CAN_PAY: ScriptConfig;
    SUDT: ScriptConfig;
    PW_NON_ANYONE_CAN_PAY: ScriptConfig;
    PW_ANYONE_CAN_PAY: ScriptConfig;
  };
}

export type CkitConfigKeys = keyof CkitConfig['SCRIPTS'];

export class CkitProvider extends MercuryProvider {
  override get config(): CkitConfig {
    return super.config as CkitConfig;
  }

  override getScriptConfig(key: CkitConfigKeys): ScriptConfig {
    const scriptConfig = super.getScriptConfig(key);
    if (!scriptConfig) throw new Error(`cannot find the ${key} script config, maybe init failed`);
    return scriptConfig;
  }

  override newScript(configKey: CkitConfigKeys, args = '0x'): Script {
    const script = super.newScript(args, configKey);
    if (!script) throw new Error(`cannot find the ${configKey} script config, maybe init failed`);

    return script;
  }

  newSudtScript(issuerAddress: Address): Script {
    const issuerLockHash = utils.computeScriptHash(this.parseToScript(issuerAddress));

    return this.newScript('SUDT', issuerLockHash);
  }

  override getCellDep(configKey: CkitConfigKeys): CellDep {
    const dep = super.getCellDep(configKey);
    if (!dep) throw new Error(`cannot find the ${configKey} script config, maybe init failed`);

    return dep;
  }
}
