// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStaking {
    struct Stake {
        uint256 stakeId;
        address stakerAddress;
        uint256 balance;
        uint256 releaseTime;
    }

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);

    function stake(uint256 _amount) external;

    function unstake(uint256 _stakeId) external;
}
