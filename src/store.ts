import './assets/map_marker.svg';

import * as firebase from 'firebase/app';

import { logger } from 'compote/components/logger';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { Request } from './request';
import { User } from './user';

interface State {
  /** Current user */
  currentUser: User;
  map: google.maps.Map;
  markers: Record<string, google.maps.Marker>;
  requestPopup: RequestPopupState;
  requests: Request[];
}

export enum Actions {
  USER_DETAILS_LOADED = 'USER_DETAILS_LOADED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',

  MAP_INITIALIZED = 'MAP_INITIALIZED',

  REQUEST_ADDED = 'REQUEST_ADDED',
  REQUEST_REMOVED = 'REQUEST_REMOVED',
  REQUEST_MARKER_CLICKED = 'REQUEST_MARKER_CLICKED'
}

export const store = createStore(
  combineReducers<State>({ currentUser, map, markers, requestPopup, requests }),
  process.env.NODE_ENV === 'production' ? undefined : applyMiddleware(logger)
);

// Current User
type CurrentUserAction = Action<Actions> & { auth?: firebase.User, user?: User };

export function currentUser(state: Partial<User> = null, action: CurrentUserAction = {}): Partial<User> {
  switch (action.type) {
  case Actions.USER_DETAILS_LOADED:
    return { ...state, ...action.user };
  case Actions.USER_LOGGED_IN:
    return { auth: action.auth };
  case Actions.USER_LOGGED_OUT:
    return {};
  default:
    return state;
  }
}

// Map
type MapAction = Action<Actions> & { element?: Element };

export function map(state: google.maps.Map = null, action: MapAction = {}): google.maps.Map {
  switch (action.type) {
  case Actions.MAP_INITIALIZED:
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: 43.541944, lng: 28.609722 }); // East
    bounds.extend({ lat: 43.80948, lng: 22.357125 }); // West
    bounds.extend({ lat: 44.2125, lng: 22.665833 }); // North
    bounds.extend({ lat: 41.234722, lng: 25.288333 }); // South

    const map = new google.maps.Map(action.element, { center: bounds.getCenter() });
    map.fitBounds(bounds);

    return map;
  default:
    return state;
  }
}

// Markers
type MarkerAction = RequestAction & { map?: google.maps.Map };

export function markers(state: Record<string, google.maps.Marker> = {}, action: MarkerAction = {}): Record<string, google.maps.Marker> {
  switch (action.type) {
  case Actions.MAP_INITIALIZED:
    Object.keys(state).map((requestId) => state[requestId].setMap(null));
    return {};
  case Actions.REQUEST_ADDED:
    if (state[action.request.id]) {
      state[action.request.id].setMap(null);
    }

    const marker = new google.maps.Marker({
      map: action.map,
      position: action.request.geo,
      title: action.request.title,
      icon: 'map_marker.svg'
    });
    marker.addListener('click', () => store.dispatch({ type: Actions.REQUEST_MARKER_CLICKED, marker, request: action.request }));

    return { ...state, [action.request.id]: marker };
  case Actions.REQUEST_REMOVED:
    const result: Record<string, google.maps.Marker> = {};
    Object.keys(state)
      .filter((requestId) => {
        if (requestId === action.request.id) {
          state[requestId].setMap(null);
          return false;
        }
        return true;
      })
      .map((requestId) => {
        result[requestId] = state[requestId];
      });
    return result;
  default:
    return state;
  }
}

// RequestPopup
type RequestPopupAction = RequestAction & { marker?: google.maps.Marker };

interface RequestPopupState {
  request?: Request;
  popup?: google.maps.InfoWindow;
}

export function requestPopup(state: RequestPopupState = {}, action: RequestPopupAction = {}): RequestPopupState {
  switch (action.type) {
  case Actions.REQUEST_MARKER_CLICKED:
    closePopup(state.popup);

    const popup = new google.maps.InfoWindow({
      content: `
        ${action.request.imageUrls ? action.request.imageUrls.map((imageUrl) => `
          <img class="width-xl mr-sm" src="${imageUrl}" />
        `).join('') : ''}
        <h4>${action.request.title}</h4>${action.request.text}
      `
    });
    popup.open(action.marker.getMap(), action.marker);

    return { request: action.request, popup };
  case Actions.MAP_INITIALIZED:
    closePopup(state.popup);
    return {};
  case Actions.REQUEST_REMOVED:
    if (state.request && state.request.id === action.request.id) {
      closePopup(state.popup);
    }
    return {};
  default:
    return state;
  }
}

const closePopup = (popup: google.maps.InfoWindow) => {
  if (popup) {
    popup.close();
  }
};

// Requests
type RequestAction = Action<Actions> & { request?: Request };

export function requests(state: Request[] = [], action: RequestAction = {}): Request[] {
  switch (action.type) {
  case Actions.MAP_INITIALIZED:
    return [];
  case Actions.REQUEST_ADDED:
    return [action.request, ...state];
  case Actions.REQUEST_REMOVED:
    return state.filter((request) => request.id !== action.request.id);
  default:
    return state;
  }
}
