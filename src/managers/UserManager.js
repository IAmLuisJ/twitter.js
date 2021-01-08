'use strict';

import User from '../structures/User.js';
import BaseManager from './BaseManager.js';
import { queryTypes } from '../util/Constants.js';
import { userBuilder } from '../util/StructureBuilder.js';
import { cleanFetchManyUsersResponse } from '../util/ResponseCleaner.js';

/**
 * Manages the API methods for users and stores their cache
 * @extends {BaseManager}
 */
class UserManager extends BaseManager {
  /**
   * @param {Client} client The client that instantiated this class
   */
  constructor(client) {
    super(client, User);
  }
  /**
   * The cache of this manager
   * @type {Collection<Snowflake, User>}
   * @name UserManager#cache
   */

  /**
   * Data that resolves to a User object. This can be:
   * * A User object
   * * A user ID
   * * A username
   * @typedef {User|Snowflake|string} UserResolvable
   */

  /**
   * Resolves a UserResolvable to a User object
   * @param {UserResolvable} userResolvable The id, username, or instance of a User object
   * @returns {?User}
   */
  resolve(userResolvable) {
    const user = super.resolve(userResolvable);
    if (user) return user;
    const userID = super.resolveID(userResolvable);
    if (userID) return super.resolve(userID);
    if (typeof userResolvable === 'string') return this.cache.find(user => user.username === userResolvable);
    return null;
  }

  /**
   * Resolves a UserResolvable to a user ID
   * @param {UserResolvable} userResolvable The id, username, or instance of a User object
   * @returns {?Snowflake}
   */
  resolveID(userResolvable) {
    const userID = super.resolveID(userResolvable);
    if (userID) return userID;
    if (typeof userResolvable === 'string') return this.cache.find(user => user.username === userResolvable)?.id;
    return null;
  }

  /**
   * Options used to fetch a single user
   * @typedef {Object} FetchUserOptions
   * @property {UserResolvable} user The user to fetch
   * @property {boolean} [cache=true] Whether to cache the fetched user or not
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Options used to fetch multiple users
   * @typedef {Object} FetchUsersOptions
   * @property {UserResolvable|UserResolvable[]} user The user(s) to fetch
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Fetches user(s) from Twitter
   * @param {UserResolvable|FetchUserOptions|FetchUsersOptions} [options] Options to fetch user(s)
   * @returns {Promise<User>|Promise<Collection<Snowflake, User>>}
   * @example
   * // Fetch a user using ID
   * client.users.fetch('1234567890')
   * 	.then(console.log)
   * 	.catch(console.error);
   */
  async fetch(options) {
    const userID = this.resolveID(options);
    if (userID) {
      const userData = await this._fetchSingle(userID, queryTypes.ID);
      const user = userBuilder(this.client, userData);
      return user;
    }
    if (typeof options === 'string') {
      const userData = await this._fetchSingle(options, queryTypes.USERNAME);
      const user = userBuilder(this.client, userData);
      return user;
    }
    if (options.user) {
      if (Array.isArray(options.user)) {
        const userIdsArray = [];
        const userNamesArray = [];
        options.user.forEach(userResolvable => {
          const userID = this.resolveID(userResolvable);
          if (userID) {
            userIdsArray.push(userID);
          } else if (typeof userResolvable === 'string') {
            userNamesArray.push(userResolvable);
          }
        });
        const usersResponse = [];
        if (userIdsArray.length) usersResponse.push(await this._fetchMany(userIdsArray, queryTypes.ID));
        if (userNamesArray.length) usersResponse.push(await this._fetchMany(userNamesArray, queryTypes.USERNAME));
        const userData = cleanFetchManyUsersResponse(usersResponse);
        const usersCollection = userBuilder(this.client, userData);
        return usersCollection;
      } else {
        const userID = this.resolveID(options.user);
        if (userID) {
          const userData = await this._fetchSingle(options.user, queryTypes.ID);
          const user = userBuilder(this.client, userData);
          return user;
        }
        if (typeof options.user === 'string') {
          const userData = await this._fetchSingle(options.user, queryTypes.USERNAME);
          const user = userBuilder(this.client, userData);
          return user;
        }
      }
    }
  }

  /**
   * Fetches a single user from Twitter
   * @param {Snowflake|string} query Either an ID or the username of the user to fetch
   * @param {string} queryType Specifies whether the query is an id or username
   * @private
   */
  async _fetchSingle(query, queryType) {
    if (queryType === queryTypes.ID) return await this.client.rest.fetchUserById(query);
    if (queryType === queryTypes.USERNAME) return await this.client.rest.fetchUserByUsername(query);
  }

  /**
   * Fetches users from Twitter
   * @param {Array<Snowflake|string>} query An array of IDs or usernames of the users to fetch
   * @param {string} queryType Specifies whether the query is an array of IDs or usernames
   * @private
   */
  async _fetchMany(query, queryType) {
    if (queryType === queryTypes.ID) return await this.client.rest.fetchUsersByIds(query);
    if (queryType === queryTypes.USERNAME) return await this.client.rest.fetchUsersByUsernames(query);
  }
}

export default UserManager;