import { useMemo, useCallback, useRef } from 'react';

/**
 * PUBLIC_INTERFACE
 * createStableActions
 * Ensures action functions have stable identity across renders by memoizing
 * a wrapper that binds the provided actions to the current dispatchers.
 */
export function createStableActions(actionsFactory, deps = []) {
  // actionsFactory should return an object with methods (actions) when called.
  // We memoize the returned actions object to keep referential stability.
  // deps should include any external references that impact the actions.
  return useMemo(() => actionsFactory(), deps);
}

/**
 * PUBLIC_INTERFACE
 * useShallowMemo
 * Shallowly memoize a derived state object to maintain stable identity
 * if keys and shallow values haven't changed.
 */
export function useShallowMemo(value) {
  const ref = useRef(value);
  const prev = ref.current;

  const isShallowEqual = (a, b) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is(a[k], b[k])) {
        return false;
      }
    }
    return true;
  };

  const memoized = isShallowEqual(prev, value) ? prev : value;
  ref.current = memoized;
  return memoized;
}

/**
 * PUBLIC_INTERFACE
 * useMemoSelector
 * Memoize selection from a state getter to ensure stable references and avoid unnecessary re-renders.
 */
export function useMemoSelector(selectorFactory, deps = []) {
  return useMemo(() => selectorFactory(), deps);
}

/**
 * PUBLIC_INTERFACE
 * bindActions
 * Binds action creators with underlying API/dispatch functions into a stable actions object.
 */
export function bindActions(actionCreators, bindDeps = []) {
  return useMemo(() => {
    const bound = {};
    Object.keys(actionCreators).forEach((key) => {
      const fn = actionCreators[key];
      if (typeof fn === 'function') {
        // ensure stable identity by wrapping in useCallback-like behavior via memo result
        bound[key] = (...args) => fn(...args);
      }
    });
    return bound;
  }, bindDeps);
}
