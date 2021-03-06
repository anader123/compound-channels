# cChannels
_Earn interest while sending payments off chain_

## Description
cChannels are a series of payment channel contracts that support both Ether and ERC20 payments. When the funds are deposited into a cChannel, they are then locked into Compound and are constantly earning interest for the depositor, while being spent off chain. Users can directly add more funds to the contract or even borrow against different collateral types supported by Compound to fund their channel (Borrow DAI against ETH to fund a DAI cChannel).

Compound works well with payment channels because (excluding a black swan event) the worst outcome is an interest rate of 0% while the channel is open. So effectively, as the sender you can have your money working for you while locked up in a payment channel and as the recipient you can be reasonably confident that the channel will be solvent by the time you go to close it and claim your funds. 

## Contract Addresses (Kovan)
* Channel Factory: 0xC87a2Bc93dbFa4Fa0E0C34Bacfab09dF48F58403
* ETH Channel Template: 0xD35e97d9AFfaf66c4B6d5A5C6C5d0B09643DAE0d
* ERC20 Channel Template: 0xC12ddC6979cc2000C93CE7295D3cDe4A2da44395


## Resources Used
* EIP 712 to verify signatures in the smart contracts
* EIP 1167 to create minimal viable proxies for the channels
* Integrated with Compound smart contracts
* eth_signTypedData_v3 to sign messages on the frontend
* sigUtil to verify signatures on the frontend
* React with Rebass

## Transaction Benchmarks

![](src/Images/benchmarks.png)

## Diagrams 
### Depositing Funds to a cChannel
_Sender deposits Dai to the cChannel and the Dai is then locked into Compound until the channel is closed._

![](src/Images/deposit.png)

### Closing a Channel
_Recipient closes the channel and withdraws their alloted amount and the sender is returned the remaining amount as well as the interest accrued._

![](src/Images/closeComp.png)

### Borrowing Asset to Fund a Channel
_Sender borrows DAI from Compound to fund the channel against their Ether._

![](src/Images/borrowFunds.png)

### Closing a Channel and Repaying Debt
_Recipient closes the channel and withdraws their alloted amount and the sender is returned the remaining amount plus the interest accrued. The sender is able to repay their debt to Compound at anytime and withdaw the asset they borrow against. Note that the sender is better off because they borrowed the Eth to fund the DAI channel since the market price for Eth went from 1ETH = 100DAI to 1ETH = 200DAI._

![](src/Images/closeBorrow.png)

### Force Closing a Channel
_The force close function can only be called by the sender if the current time is greater than the end time that was specified when the channel was created. It is meant to be an action of last resort if the recipient never submits a signature._

![](src/Images/forceC.png)