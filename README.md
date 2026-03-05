# SaySeismicSwap

A lightweight decentralized exchange (DEX) running on the **Seismic Testnet**. Swap ERC20 test tokens and mint from a built-in faucet — all on-chain, no real value involved.

---

## What It Does

**Swap** — Exchange any pair of the four supported test tokens using a constant-product AMM model. The UI shows you the exchange rate, estimated price impact, minimum received (with 0.5% slippage tolerance), and estimated gas before you confirm.

**Faucet** — Mint up to 1,000 of any test token directly to your wallet. Each token has a 24-hour on-chain cooldown enforced by the Faucet contract, with a live countdown timer shown in the UI.

**Info** — View network details (Chain ID, RPC, block explorer), mock token prices used for swap calculations, and a testnet disclaimer.

---

## Supported Tokens

| Symbol | Name            | Address |
|--------|-----------------|---------|
| SEIS   | Seismic Token   | `0x26a41c14bbA8B80b2602e2B3C94b7baC068b8888` |
| USDT   | Test USDT       | `0x4c3503d0468408BE28b09A9bba762fF9E49e485b` |
| WBTC   | Wrapped Bitcoin | `0x281E98c567cBda60976491b3D155c7fDD1A8339a` |
| DAI    | Test DAI        | `0xc2b842145331FAcc133627ba90c3f07ff5184862` |

---

## Contracts (Seismic Testnet)

| Contract | Address |
|----------|---------|
| Faucet   | `0xB728c86D6240F196ac70659c4849E8379C56c76C` |
| Swap     | `0x054340eA707Bb682ba5C2bC57E134bd689550DB8` |

---

## Network

| Property       | Value |
|----------------|-------|
| Network Name   | Seismic Testnet |
| Chain ID       | 5124 |
| RPC URL        | `https://gcp-2.seismictest.net/rpc` |
| Block Explorer | [seismic-testnet.socialscan.io](https://seismic-testnet.socialscan.io) |
| Native Faucet  | [faucet.seismictest.net](https://faucet.seismictest.net/) |

---


## Disclaimer

This is a testnet-only application built for educational purposes. All tokens are mock tokens with no real monetary value. Do not send real funds to any contract listed here.

---

> **Stay up to date** — Follow my tg channel [87 Labs](https://t.me/Labs87) for updates, new deployments, and more tools like this.
