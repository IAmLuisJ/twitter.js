import type { Client } from '../client';
import type { FilteredStreamRuleResolvable } from './Types';
import type { ClientEvents, Collection } from '../util';
import type { Tweet, RequestData, MatchingRule } from '../structures';
import type { TweetResolvable, UserResolvable, SpaceResolvable } from './Types';
import type {
  APITweetReplySettings,
  Granularity,
  MediaFieldsParameter,
  PlaceFieldsParameter,
  PollFieldsParameter,
  Snowflake,
  SpaceExpansionsParameter,
  SpaceFieldsParameter,
  TweetExpansionsParameter,
  TweetFieldsParameter,
  TweetTypeExcludesRequestParameter,
  UserExpansionsParameter,
  UserFieldsParameter,
} from 'twitter-types';

/**
 * The options for the API in use
 */
export interface ApiOptions {
  /**
   * Current default version of the API
   */
  version: number;

  /**
   * The base URL of the API
   */
  baseURL: string;
}

/**
 * The common optional options to provide while fetching a content
 */
export interface BaseFetchOptions {
  /**
   * Whether to skip cache check for the requested content and fetch from the API directly
   */
  skipCacheCheck?: boolean;

  /**
   * Whether to store the fetched content in cache for later use
   */
  cacheAfterFetching?: boolean;
}

export interface ClientCredentialsInterface {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  username: string;
  bearerToken: string;
}

export interface ClientEventsMapping {
  filteredTweetCreate: [tweet: Tweet, matchingRules: Collection<Snowflake, MatchingRule>];
  keepAliveSignal: [stream: 'sampled' | 'filtered'];
  partialError: [partialError: Record<string, unknown>];
  ready: [client: Client];
  sampledTweetCreate: [tweet: Tweet];
}

/**
 * The options which the client gets initialized with
 */
export interface ClientOptions {
  /**
   * The options provided for the API
   */
  api?: ApiOptions;

  /**
   * The options provided for query of an API request
   */
  queryParameters?: QueryParameters;

  /**
   * The options for selecting what events should be fired
   */
  events: Array<keyof typeof ClientEvents>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorMessageBuilder = (...args: Array<any>) => string;

export interface ExtendedRequestData<Q, B> extends RequestData<Q, B> {
  route: string;
}

/**
 * Options used to fetch a single user by its username
 */
export interface FetchUserByUsernameOptions extends BaseFetchOptions {
  /**
   * The username of the user to fetch
   */
  username: string;
}

/**
 * Options used to fetch multiple users by their usernames
 */
export interface FetchUsersByUsernamesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The usernames of the users to fetch
   */
  usernames: Array<string>;
}

/**
 * Options used to fetch a single user
 */
export interface FetchUserOptions extends BaseFetchOptions {
  /**
   * The user to fetch
   */
  user: UserResolvable;
}

/**
 * Options used to fetch multiple users
 */
export interface FetchUsersOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The users to fetch
   */
  users: Array<UserResolvable>;
}

/**
 * Options used to feth a single tweet
 */
export interface FetchTweetOptions extends BaseFetchOptions {
  /**
   * The tweet to fetch
   */
  tweet: TweetResolvable;
}

/**
 * Options used to feth multiple tweets
 */
export interface FetchTweetsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The tweets to fetch
   */
  tweets: Array<TweetResolvable>;
}

/**
 * Options used to fetch a single space
 */
export interface FetchSpaceOptions extends BaseFetchOptions {
  /**
   * The space to fetch
   */
  space: SpaceResolvable;
}

/**
 * Options used to fetch multiple spaces
 */
export interface FetchSpacesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The spaces to fetch
   */
  spaces: Array<SpaceResolvable>;
}

/**
 * Options used to fetch spaces using creator ids
 */
export interface FetchSpacesByCreatorIdsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The creators whose spaces are to be fetched
   */
  users: Array<UserResolvable>;
}

/**
 * The options used to search spaces
 */
export interface SearchSpacesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The query to match with
   */
  query: string;

  /**
   * The state of the spaces to match
   */
  state: 'live' | 'scheduled';

  /**
   * The number of maximum spaces to fetch
   */
  maxResults?: number;
}

export interface QueryParameters {
  userFields?: Array<UserFieldsParameter>;
  tweetFields?: Array<TweetFieldsParameter>;
  spaceFields?: Array<SpaceFieldsParameter>;
  mediaFields?: Array<MediaFieldsParameter>;
  placeFields?: Array<PlaceFieldsParameter>;
  pollFields?: Array<PollFieldsParameter>;
  tweetExpansions?: Array<TweetExpansionsParameter>;
  userExpansions?: Array<UserExpansionsParameter>;
  spaceExpansions?: Array<SpaceExpansionsParameter>;
}

export interface StructureConstructable<T> {
  // eslint-disable-next-line
  new(...args: any[]): T;
}

export interface TwitterjsErrorConstructor {
  // eslint-disable-next-line
  new(key: string, ...args: Array<unknown>): Error;
}

/**
 * The options used to add a new filtered tweet stream rule
 */
export interface FilteredStreamRuleData {
  /**
   * The value of the rule
   */
  value: string;

  /**
   * The label of the rule
   */
  tag?: string;
}

export interface RequestDataOptions<Q, B> {
  /**
   * The query for the request
   */
  query?: Q;

  /**
   * The body for the request
   */
  body?: B;

  /**
   * Whether the request results in a persisent http connection
   */
  isStreaming?: boolean;

  /**
   * Whether the request should be authorized with user context authorization
   */
  isUserContext?: boolean;
}

/**
 * The options used to fetch users blocked by the authorized user
 */
export interface FetchBlocksOptions {
  /**
   * The maximum number of users to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to fetch users muted by the authorized user
 */
export interface FetchMutesOptions {
  /**
   * The maximum number of users to fetch per page
   */
  maxResultsPerPage?: number;
}

export interface BookOptions {
  /**
   * The ID of the user to create the book for
   */
  userId: Snowflake;

  /**
   * The maximum number of results to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to fetch tweets composed by a twitter user
 */
export interface FetchComposedTweetsOptions {
  /**
   * Fetch tweets that were created after this point in time
   */
  afterTime?: Date | number;

  /**
   * Fetch tweets that were created before this point in time
   */
  beforeTime?: Date | number;

  /**
   * Fetch tweets that were created after this tweet
   */
  afterTweet?: TweetResolvable;

  /**
   * Fetch tweets that were created before this tweet
   */
  beforeTweet?: TweetResolvable;

  /**
   * The types of tweet to exclude from fetching
   */
  exclude?: Array<TweetTypeExcludesRequestParameter>;

  /**
   * The maximum number of tweets to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to create a {@link ComposedTweetsBook} object for a user
 */
export interface ComposedTweetsBookOptions extends BookOptions {
  /**
   * Return tweets that were created after this timestamp
   */
  afterTimestamp?: number;

  /**
   * Return tweets that were created before this timestamp
   */
  beforeTimestamp?: number;

  /**
   * The types of tweets to exclude
   */
  exclude?: Array<TweetTypeExcludesRequestParameter>;

  /**
   * Return tweets that were created after this tweet ID
   */
  afterTweetId?: Snowflake;

  /**
   * Return tweets that were created before this tweet ID
   */
  beforeTweetId?: Snowflake;
}

/**
 * The options used to create a {@link MentionsBook} object
 */
export interface MentionsBookOptions extends BookOptions {
  /**
   * Return tweets that were created after this timestamp
   */
  afterTimestamp?: number;

  /**
   * Return tweets that were created before this timestamp
   */
  beforeTimestamp?: number;

  /**
   * Return tweets that were created after this tweet ID
   */
  afterTweetId?: Snowflake;

  /**
   * Return tweets that were created before this tweet ID
   */
  beforeTweetId?: Snowflake;
}

/**
 * The options used to fetch tweets that mention a given user
 */
export interface FetchMentionsOptions {
  /**
   * Fetch tweets that were created after this point in time
   */
  afterTime?: Date | number;

  /**
   * Fetch tweets that were created before this point in time
   */
  beforeTime?: Date | number;

  /**
   * Fetch tweets that were created after this tweet
   */
  afterTweet?: TweetResolvable;

  /**
   * Fetch tweets that were created before this tweet
   */
  beforeTweet?: TweetResolvable;

  /**
   * The maximum number of tweets to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to create a {@link SearchTweetsBook} object
 */
export interface SearchTweetsBookOptions {
  query: string;

  /**
   * Return tweets that were created after this timestamp
   */
  afterTimestamp?: number;

  /**
   * Return tweets that were created before this timestamp
   */
  beforeTimestamp?: number;

  /**
   * Return tweets that were created after this tweet ID
   */
  afterTweetId?: Snowflake;

  /**
   * Return tweets that were created before this tweet ID
   */
  beforeTweetId?: Snowflake;

  /**
   * The maximum number of results to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to fetch tweets using query
 */
export interface SearchTweetsOptions {
  /**
   * Fetch tweets that were created after this point in time
   */
  afterTime?: Date | number;

  /**
   * Fetch tweets that were created before this point in time
   */
  beforeTime?: Date | number;

  /**
   * Fetch tweets that were created after this tweet
   */
  afterTweet?: TweetResolvable;

  /**
   * Fetch tweets that were created before this tweet
   */
  beforeTweet?: TweetResolvable;

  /**
   * The maximum number of tweets to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to create a {@link TweetsCountBook} object
 */
export interface TweetsCountBookOptions {
  /**
   * The query for matching tweets
   */
  query: string;

  /**
   * Match tweets that were created after this timestamp
   */
  afterTimestamp?: number;

  /**
   * Match tweets that were created before this timestamp
   */
  beforeTimestamp?: number;

  /**
   * The granularity of the {@link TweetCountBucket}
   */
  granularity?: Granularity;

  /**
   * Match tweets that were created after this tweet ID
   */
  afterTweetId?: Snowflake;

  /**
   * Match tweets that weere created before this tweet ID
   */
  beforeTweetId?: Snowflake;
}

/**
 * The options for fetching tweets count matching a query
 */
export interface CountTweetsOptions {
  /**
   * Match tweets that were created after this point in time
   */
  afterTime?: Date | number;

  /**
   * Match tweets that were created before this point in time
   */
  beforeTime?: Date | number;

  /**
   * Match tweets that were created after this tweet
   */
  afterTweet?: TweetResolvable;

  /**
   * Match tweets that were created before this tweet
   */
  beforeTweet?: TweetResolvable;

  /**
   * The granularity of the {@link TweetCountBucket}
   */
  granularity?: Granularity;
}

/**
 * The data to instantiate {@link BaseStructure} with
 */
export interface BaseStructureData {
  id: Snowflake;
}

/**
 * The options used for creating a new list
 */
export interface CreateListOptions {
  /**
   * The name of the list
   */
  name: string;

  /**
   * The description of the list
   */
  description?: string;

  /**
   * Whether the list should be private
   */
  private?: boolean;
}

/**
 * The options used to update a list
 */
export type UpdateListOptions = Partial<CreateListOptions>;

/**
 * Options used to feth a single filtered stream rule
 */
export interface FetchFilteredStreamRuleOptions extends BaseFetchOptions {
  /**
   * The rule to fetch
   */
  rule: FilteredStreamRuleResolvable;
}

/**
 * Options used to feth multiple filtered stream rules
 */
export interface FetchFilteredStreamRulesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The rules to fetch, fetches all if not provided
   */
  rules?: Array<FilteredStreamRuleResolvable>;
}

/**
 * Options used to craete a tweet
 */
export interface TweetCreateOptions {
  directMessageDeepLink?: string;
  forSuperFollowersOnly?: boolean;
  geo?: TweetCreateGeoOptions;
  media?: TweetCreateMediaOptions;
  poll?: TweetCreatePollOptions;
  quoteTweet?: TweetResolvable;
  excludeReplyUsers?: Array<UserResolvable>;
  inReplyToTweet?: TweetResolvable;
  replySettings?: APITweetReplySettings;
  text?: string;
}

export interface TweetCreateGeoOptions {
  placeId: string;
}

export interface TweetCreateMediaOptions {
  mediaIds?: Array<Snowflake>;
  taggedUsers?: Array<UserResolvable>;
}

export interface TweetCreatePollOptions {
  durationMinutes: number;
  options: Array<string>;
}
