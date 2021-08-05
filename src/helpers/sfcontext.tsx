import React from "react";

interface SF {}

const sfcontext = React.createContext<any | null>(null);

export const SFProvider = sfcontext.Provider;
export const SFConsumer = sfcontext.Consumer;

export default sfcontext;
