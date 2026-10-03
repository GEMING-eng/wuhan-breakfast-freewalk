import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import {initialState,storyReducer,type StoryState,type Action} from './storyReducer';
import {readSave,writeSave} from './persistence';
const Context=createContext<{state:StoryState;dispatch:Dispatch<Action>;saveFailed:boolean}|null>(null);
export function StoryProvider({children}:{children:ReactNode}) {
  const [saveFailed,setSaveFailed]=useState(false);
  const [state,dispatch]=useReducer(storyReducer,undefined,()=>{try{const saved=readSave(window.localStorage);return saved.state??initialState({...initialState().settings,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});}catch{return initialState();}});
  useEffect(()=>{try{setSaveFailed(!writeSave(window.localStorage,state));}catch{setSaveFailed(true);}},[state]);
  return <Context.Provider value={{state,dispatch,saveFailed}}>{children}</Context.Provider>;
}
export function useStory(){const c=useContext(Context);if(!c)throw Error('StoryProvider missing');return c;}
