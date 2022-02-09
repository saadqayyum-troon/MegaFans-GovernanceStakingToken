// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title The interface for Governance Token Staking
/// @notice The Staking contract facilitates staking and unstaking of governance tokens
interface IStaking {
    struct Stake {
        uint256 stakeId;
        address stakerAddress;
        uint256 balance;
        uint256 releaseTime;
    }

    /// @notice Emitted when the token is staked
    /// @param staker The address who staked token
    /// @param amount The amount of governance tokens staked
    event Staked(address indexed staker, uint256 amount);

    /// @notice Emitted when the token is unstaked
    /// @param staker The address corressponding to passed stake after unstaking
    /// @param amount The amount corressponding to passed stake after unstaking
    event Unstaked(address indexed staker, uint256 amount);

    /// @notice Stakes GT Token of caller
    /// @param _amount GT Tokens amount which will be staked
    /// @dev The passes _amount will be transferred to this contract
    function stake(uint256 _amount) external;

    /// @notice Unstakes GT tokens
    /// @param _stakeId Stake Id which will be unstaked
    /// @dev It transfers unstaking amount back to staker and it clears the stake mapping corresponding to
    /// stake id (set to null)
    function unstake(uint256 _stakeId) external;
}
