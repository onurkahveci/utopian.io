import { createAction } from 'redux-actions';
import * as actionTypes from './feedActionTypes';

import { getDiscussionsFromAPI } from './../helpers/apiHelpers';
import { getFeedFromState, getFeedContentFromState, getFeedLoadingFromState } from './../helpers/stateHelpers';

export const getFeedContentWithoutAPI = createAction(actionTypes.GET_FEED_CONTENT);
export const getFeedContentSuccess = createAction(actionTypes.GET_FEED_CONTENT_SUCCESS);

export const getMoreFeedContentWithoutAPI = createAction(actionTypes.GET_MORE_FEED_CONTENT);
export const getMoreFeedContentSuccess = createAction(actionTypes.GET_MORE_FEED_CONTENT_SUCCESS);

export const getFeedContent = ({ sortBy, category, limit }) => {
  return (dispatch, getState) => {
    if(getFeedFromState(sortBy, category, getState().feed).length) {
      return;
    }

    dispatch(getFeedContentWithoutAPI({
      sortBy: sortBy || 'trending',
      category: category || 'all',
    }));

    getDiscussionsFromAPI(sortBy, window.steemAPI, {
      tag: category,
      limit,
    },
    (err, postsData) => {
      if (err) {
        console.error(`error while loading ${sortyBy}/${category}`, JSON.stringify(err));
        return;
      }

      dispatch(
        getFeedContentSuccess({
          sortBy: sortBy || 'trending',
          category: category || 'all',
          postsData,
        })
      );
    });
  };
};

export const getMoreFeedContent = ({ sortBy, category, limit }) => {
  return (dispatch, getState) => {
    const feedContent = getFeedContentFromState(
        sortBy, category, getState().feed, getState().posts);
    const isLoading = getFeedLoadingFromState(sortBy, category, getState().feed);

    if (!feedContent.length || isLoading) {
      // exit early
      return;
    }

    dispatch(getMoreFeedContentWithoutAPI({
      sortBy: sortBy || 'trending',
      category: category || 'all',
    }));

    const startAuthor = feedContent[feedContent.length - 1].author;
    const startPermlink = feedContent[feedContent.length - 1].permlink;

    getDiscussionsFromAPI(sortBy, window.steemAPI, {
      tag: category,
      limit: limit + 1,
      start_author: startAuthor,
      start_permlink: startPermlink,
    },
    (err, postsData) => {
      if (err) {
        console.error(`error while loading ${sortyBy}/${category}`, JSON.stringify(err));
        return;
      }

      dispatch(
        getMoreFeedContentSuccess({
          sortBy: sortBy || 'trending',
          category: category || 'all',
          postsData,
        })
      );
    });
  };
};
