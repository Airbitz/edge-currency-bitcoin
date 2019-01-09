// @flow
import { patchSecp256k1, patchPbkdf2 } from './patchCrypto.js'
import { patchTransaction } from './replayProtection.js'
import { getHDSettings } from './bips.js'
import bcoin from 'bcoin'

export type BcoinCurrencyInfo = {
  type: string,
  magic: number,
  supportedBips: Array<number>,
  forks?: Array<string>,
  keyPrefix: {
    privkey: number,
    xpubkey: number,
    xprivkey: number,
    xpubkey58: string,
    xprivkey58: string,
    coinType: number
  },
  addressPrefix: {
    pubkeyhash: number,
    scripthash: number,
    cashAddress?: string,
    pubkeyhashLegacy?: number,
    scripthashLegacy?: number,
    witnesspubkeyhash?: number,
    witnessscripthash?: number,
    bech32?: string
  },
  replayProtection?: {
    SIGHASH_FORKID: number,
    forcedMinVersion: number,
    forkId: number
  }
}

let cryptoReplaced = false
patchTransaction(bcoin)

export const addNetwork = (bcoinInfo: BcoinCurrencyInfo) => {
  const { supportedBips, keyPrefix, type } = bcoinInfo
  if (bcoin.networks.types.indexOf(type) === -1) {
    bcoin.networks.types.push(type)
    const hdSettings = getHDSettings(supportedBips, keyPrefix.coinType)
    const scriptTemplates = {
      addresses: [],
      purpose: 0,
      path: () => '',
      nested: false,
      witness: false,
      scriptType: ''
    }
    bcoin.networks[type] = {
      ...bcoin.networks.main,
      ...bcoinInfo,
      hdSettings,
      scriptTemplates
    }
  }
}

export const patchCrypto = (secp256k1?: any = null, pbkdf2?: any = null) => {
  if (!cryptoReplaced) {
    if (secp256k1) {
      patchSecp256k1(bcoin, secp256k1)
      cryptoReplaced = true
    }
    if (pbkdf2) {
      patchPbkdf2(bcoin, pbkdf2)
      cryptoReplaced = true
    }
  }
}
