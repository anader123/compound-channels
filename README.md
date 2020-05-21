# cChannels
_Earn interest while sending payments off chain_

## Description
cChannels are a series of payment channel contracts that supports both Ether and ERC20 payments. While funds are in the channel, they are locked into Compound and are constantly earning interest for the depositor. Users can directly add more funds to the contract or even borrow against different collateral types supported by Compound to fund their channel.

## Resources Used
* EIP 712 to verify signatures in the smart contracts
* EIP 1167 to create minimal viable proxies for the channels
* Integrated with Compound smart contracts
* eth_signTypedData_v3 to sign messages on the frontend
* sigUtil to verify signatures on the frontend
* React with Rebass

## Diagrams 
### Depositing Funds to a cChannel
_Sender adds Dai to the cChannel and the Dai is then locked into Compound until the channel is closed._

![](src/Images/deposit.png)

### Closing a Channel
_Recipient closes the channel and withdraws their alloted amount and the sender is returned the remaining amount as well as the interest accrued._

![](src/Images/closeComp.png)

### Borrowing Asset to Fund a Channel
_Sender borrows DAI from Compound to fund the channel against Ether._

![](src/Images/borrowFunds.png)

### Closing a Channel and Repaying Debt
_Recipient closes the channel and withdraws their alloted amount and the sender is returned the remaining amount as well as the interest accrued. They the sender is able to repay their debt to Compound to withdaw their original deposit._

![](src/Images/closeBorrow.png)


## Contract Addresses (Ropsten)
* Channel Factory: 0x3FD88e3A0Db2d7BB00636f2cBE44cbc035F6d214
* ETH Channel: 0xC87a2Bc93dbFa4Fa0E0C34Bacfab09dF48F58403
* ERC20 Channel: 0xD35e97d9AFfaf66c4B6d5A5C6C5d0B09643DAE0d

## Contract Addresses (Kovan)
* Channel Factory: 0xC87a2Bc93dbFa4Fa0E0C34Bacfab09dF48F58403
* ETH Channel: 0xD35e97d9AFfaf66c4B6d5A5C6C5d0B09643DAE0d
* ERC20 Channel: 0xC12ddC6979cc2000C93CE7295D3cDe4A2da44395

_Solidity 0.6.6_