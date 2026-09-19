import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export type StoredState<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  reload: () => void,
];

// a JSON value kept in localStorage; every change is written back
export const useStorage = <T>(key: string, initialValue: T): StoredState<T> => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const loadStoredValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue, loadStoredValue];
};
