import React from "react";

const statecontext = React.createContext<any | null>(null);

export const StateProvider = statecontext.Provider;
export const StateConsumer = statecontext.Consumer;

export default statecontext;
