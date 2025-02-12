import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomTypeError } from '../errors';
import { RequestData, Space } from '../structures';
import type { Client } from '../client';
import type {
  FetchSpaceOptions,
  FetchSpacesByCreatorIdsOptions,
  FetchSpacesOptions,
  SearchSpacesOptions,
  SpaceManagerFetchResult,
  SpaceResolvable,
  UserResolvable,
} from '../typings';
import type {
  GetMultipleSpacesByCreatorIdsQuery,
  GetMultipleSpacesByCreatorIdsResponse,
  GetMultipleSpacesByIdsQuery,
  GetMultipleSpacesByIdsResponse,
  GetMultipleSpacesBySearchQuery,
  GetMultipleSpacesBySearchResponse,
  GetSingleSpaceByIdQuery,
  GetSingleSpaceByIdResponse,
  Snowflake,
} from 'twitter-types';

export class SpaceManager extends BaseManager<Snowflake, SpaceResolvable, Space> {
  /**
   * @param client The logged in {@link Client} instance
   */
  constructor(client: Client) {
    super(client, Space);
  }

  /**
   * Fetches spaces from twitter.
   * @param options The options for fetching spaces
   * @returns A {@link Space} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchSpaceOptions | FetchSpacesOptions>(options: T): Promise<SpaceManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('space' in options) {
      const spaceId = this.resolveId(options.space);
      if (!spaceId) throw new CustomTypeError('SPACE_RESOLVE_ID');
      return this.#fetchSingleSpace(spaceId, options) as Promise<SpaceManagerFetchResult<T>>;
    }
    if ('spaces' in options) {
      if (!Array.isArray(options.spaces)) throw new CustomTypeError('INVALID_TYPE', 'spaces', 'array', true);
      const spaceIds = options.spaces.map(space => {
        const spaceId = this.resolveId(space);
        if (!spaceId) throw new CustomTypeError('SPACE_RESOLVE_ID');
        return spaceId;
      });
      return this.#fetchMultipleSpaces(spaceIds, options) as Promise<SpaceManagerFetchResult<T>>;
    }
    throw new CustomTypeError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Fetches spaces of creators using their user ids.
   * @param options The options for fetching spaces
   * @returns A {@link Collection} of {@link Space} as a `Promise`
   */
  async fetchByCreatorIds(options: FetchSpacesByCreatorIdsOptions): Promise<Collection<Snowflake, Space>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if (!Array.isArray(options.users)) throw new CustomTypeError('INVALID_TYPE', 'users', 'array', true);
    const fetchedSpaceCollection = new Collection<Snowflake, Space>();
    const userIds = options.users.map(user => {
      const userId = this.client.users.resolveId(user as UserResolvable);
      if (!userId) throw new CustomTypeError('USER_RESOLVE_ID', 'fetch spaces of');
      return userId;
    });
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleSpacesByCreatorIdsQuery = {
      user_ids: userIds,
      expansions: queryParameters?.spaceExpansions,
      'user.fields': queryParameters?.userFields,
      'space.fields': queryParameters?.spaceFields,
    };
    const requestData = new RequestData({ query });
    const data: GetMultipleSpacesByCreatorIdsResponse = await this.client._api.spaces.by.creator_ids.get(requestData);
    if (data.meta.result_count === 0) return fetchedSpaceCollection;
    const rawSpaces = data.data;
    const rawSpacesIncludes = data.includes;
    for (const rawSpace of rawSpaces) {
      const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
      fetchedSpaceCollection.set(space.id, space);
    }
    return fetchedSpaceCollection;
  }

  /**
   * Fetches spaces using search query.
   * @param options Option used to search spaces
   * @returns A {@link Collection} of {@link Space} as a `Promise`
   */
  async search(options: SearchSpacesOptions): Promise<Collection<Snowflake, Space>> {
    const fetchedSpaceCollection = new Collection<Snowflake, Space>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleSpacesBySearchQuery = {
      query: options.query,
      expansions: queryParameters?.spaceExpansions,
      max_results: options.maxResults,
      'space.fields': queryParameters?.spaceFields,
      state: options.state,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetMultipleSpacesBySearchResponse = await this.client._api.spaces.search.get(requestData);
    if (data.meta.result_count === 0) return fetchedSpaceCollection;
    const rawSpaces = data.data;
    const rawSpacesIncludes = data.includes;
    for (const rawSpace of rawSpaces) {
      const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
      fetchedSpaceCollection.set(space.id, space);
    }
    return fetchedSpaceCollection;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleSpace(spaceId: Snowflake, options: FetchSpaceOptions): Promise<Space> {
    if (!options.skipCacheCheck) {
      const cachedSpace = this.cache.get(spaceId);
      if (cachedSpace) return cachedSpace;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleSpaceByIdQuery = {
      expansions: queryParameters?.spaceExpansions,
      'space.fields': queryParameters?.spaceFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetSingleSpaceByIdResponse = await this.client._api.spaces(spaceId).get(requestData);
    return this._add(data.data.id, data, options.cacheAfterFetching);
  }

  async #fetchMultipleSpaces(
    spaceIds: Array<Snowflake>,
    options: FetchSpacesOptions,
  ): Promise<Collection<Snowflake, Space>> {
    const fetchedSpaceCollection = new Collection<Snowflake, Space>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleSpacesByIdsQuery = {
      ids: spaceIds,
      expansions: queryParameters?.spaceExpansions,
      'space.fields': queryParameters?.spaceFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetMultipleSpacesByIdsResponse = await this.client._api.spaces.get(requestData);
    const rawSpaces = data.data;
    const rawSpacesIncludes = data.includes;
    for (const rawSpace of rawSpaces) {
      const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
      fetchedSpaceCollection.set(space.id, space);
    }
    return fetchedSpaceCollection;
  }
}
