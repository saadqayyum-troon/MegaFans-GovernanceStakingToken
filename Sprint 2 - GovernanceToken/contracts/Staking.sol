// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Staking is IStaking, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public stakeIdCounter;

    IERC20 GovernanceToken;

    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256) public userStakeCount;

    constructor(address _governanceToken) {
        GovernanceToken = IERC20(_governanceToken);
    }

    function stake(uint256 _amount) public {
        require(_amount > 0, "Stake: staking amount must be greater than zero");

        // msg.sender must approve _amount tokens to this contract

        // Transfer _amount token from msg.sender to this contract
        GovernanceToken.transferFrom(msg.sender, address(this), _amount);

        // Update stakes state

        stakeIdCounter.increment();
        uint256 currentStakeId = stakeIdCounter.current();

        // Calculate Release Time
        uint256 UnixTimestamp_FifteenDays = 1296000; // 15 Days
        uint256 releaseTimestamp = block.timestamp + UnixTimestamp_FifteenDays;

        stakes[currentStakeId] = Stake({
            stakeId: currentStakeId,
            stakerAddress: msg.sender,
            balance: _amount,
            releaseTime: releaseTimestamp
        });

        userStakeCount[msg.sender]++;

        emit Staked(
            stakes[currentStakeId].stakerAddress,
            stakes[currentStakeId].balance
        );
    }

    function unstake(uint256 _stakeId) public {
        Stake memory stakeState = stakes[_stakeId];

        require(
            msg.sender == stakeState.stakerAddress,
            "Unstake: Only staker can unstake!"
        );

        require(
            block.timestamp > stakeState.releaseTime,
            "Unstake: Time has not elapsed for unstaking"
        );

        GovernanceToken.transfer(msg.sender, stakeState.balance);

        delete stakes[_stakeId];

        userStakeCount[msg.sender]--;

        emit Unstaked(stakeState.stakerAddress, stakeState.balance);
    }

    function totalBalance() public view onlyOwner returns (uint256 balance) {
        balance = GovernanceToken.balanceOf(address(this));
    }

    function getStakes(address _address) public view returns (Stake[] memory) {
        uint256 count = userStakeCount[_address];
        Stake[] memory stakesData = new Stake[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= stakeIdCounter.current(); i++) {
            if (stakes[i].stakerAddress == _address) {
                Stake storage _stake = stakes[i];
                stakesData[index] = _stake;
                index++;
            }
        }

        return stakesData;
    }
}
