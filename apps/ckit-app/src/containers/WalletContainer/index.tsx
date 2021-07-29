import { ScriptConfig } from '@ckb-lumos/config-manager';
import { AbstractWallet, ConnectStatus, Signer, dummy, UnipassWallet, NonAcpPwLockWallet } from 'ckit';
import { CkitConfig, CkitProvider } from 'ckit/dist/providers/CkitProvider';
import { randomHexString } from 'ckit/dist/utils';
import { autorun } from 'mobx';
import { useLocalObservable } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';

export type CurrentWalletIndex = number | null;

export interface WalletConnectError {
  error: Error;
  index: number;
}

function useWallet() {
  const wallets = useLocalObservable<AbstractWallet[]>(() => [
    new dummy.DummyWallet() as AbstractWallet,
    new UnipassWallet() as AbstractWallet,
  ]);
  // const [signer, setSigner] = useState<Signer>();
  const [currentWalletIndex, setCurrentWalletIndex] = useState<CurrentWalletIndex>(null);
  const [error, setError] = useState<WalletConnectError | null>(null);
  const [visible, setModalVisible] = useState(false);

  useEffect(() => {
    const provider = new CkitProvider();
    const randomScriptConfig = (): ScriptConfig => ({
      HASH_TYPE: 'type',
      DEP_TYPE: 'code',
      CODE_HASH: randomHexString(64),
      TX_HASH: randomHexString(64),
      INDEX: '0x0',
    });

    const config: CkitConfig = {
      PREFIX: 'ckt',
      SCRIPTS: {
        ALWAYS_SUCCESS: randomScriptConfig(),
        ANYONE_CAN_PAY: randomScriptConfig(),
        PW_NON_ANYONE_CAN_PAY: randomScriptConfig(),
        PW_ANYONE_CAN_PAY: randomScriptConfig(),
        SECP256K1_BLAKE160: randomScriptConfig(),
        SUDT: randomScriptConfig(),
      },
    };

    void provider.init(config).then(() => wallets.push(new NonAcpPwLockWallet(provider)));
  }, []);

  useEffect(
    () =>
      autorun(() => {
        if (!wallets) return;
        wallets.forEach((wallet, index) => {
          const onConnectStatusChanged = (connectStatus: ConnectStatus) => {
            if (connectStatus === 'disconnected') {
              const connectedIndex = wallets.findIndex((w) => w.getConnectStatus === 'connected');
              if (-1 === connectedIndex) {
                setCurrentWalletIndex(null);
              } else {
                setCurrentWalletIndex(connectedIndex);
              }
            }
            if (connectStatus === 'connected') {
              setModalVisible(false);
              const connectedIndex = wallets.findIndex((w) => w.name === wallet.name);
              if (-1 === connectedIndex) {
                throw new Error('exception: wallet could not be found');
              } else {
                setCurrentWalletIndex(connectedIndex);
              }
            }
          };
          wallet.on('connectStatusChanged', onConnectStatusChanged);
          wallet.on('error', (err) => setError({ error: err as Error, index: index }));
        });
      }),
    [],
  );

  return { currentWalletIndex, setCurrentWalletIndex, wallets, error, setError, visible, setModalVisible };
}

interface SignerAddress {
  address: string | undefined;
}

export function useSigner(signer: Signer | undefined): SignerAddress {
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    setAddress(undefined);
    if (!signer) return;
    void signer.getAddress().then(setAddress);
  }, [signer]);

  return { address };
}

export const WalletContainer = createContainer(useWallet);
