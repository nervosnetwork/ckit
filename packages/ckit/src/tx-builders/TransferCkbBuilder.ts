// just for testing case, do not use it
import { Address, HexNumber, Transaction as RawRawTransaction, Transaction } from '@ckb-lumos/base';
import { Signer, TransactionBuilder } from '@ckit/base';
import { transformers } from '@lay2/pw-core';
import { CkitProvider } from '../providers';
import { PwAdapterSigner } from './pw/PwSignerAdapter';
import { ForceSimpleBuilder } from './pw/TransferCkbPwBuilder';

type CapacityPolicy =
  // mint only when recipient has ACP cell
  | 'findAcp'
  // mint and create an ACP cell for recipient
  | 'createAcp'
  // find the recipient's ACP cell, and if not find it, create a new ACP for the recipient
  | 'findOrCreateAcp';

export interface TransferCkbOptions {
  recipients: RecipientOption[];
}

interface RecipientOption {
  amount: HexNumber;
  recipient: Address;
  /**
   * defaults to findAcp
   */
  capacityPolicy?: CapacityPolicy;
}

export class TransferCkbBuilder implements TransactionBuilder {
  constructor(private options: TransferCkbOptions, private provider: CkitProvider, private signer: Signer) {}

  async build(): Promise<Transaction> {
    const builder = new ForceSimpleBuilder(this.options, this.provider, this.signer);
    const tx = await builder.build();
    const signed = await new PwAdapterSigner(this.signer).sign(tx);

    return transformers.TransformTransaction(signed) as RawRawTransaction;
  }
}