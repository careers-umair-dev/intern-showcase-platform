import { createContext, useContext } from 'react';
export const Ctx = createContext(); export const useAuth = () => useContext(Ctx);
