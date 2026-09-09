/**
 * ==============================================================================
 * USER REPOSITORY (RE-EXPORT / ALIAS)
 * ==============================================================================
 * NOTE:
 * This file maintains backward-compatibility for any imports targeting the original
 * filename spelling `user.repositry.js`.
 * The core implementation is located in `user.repository.js`.
 */
export * from './user.repository.js';
export { userRepository as default } from './user.repository.js';