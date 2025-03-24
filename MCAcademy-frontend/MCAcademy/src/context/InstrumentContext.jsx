import { createContext, useContext, useState } from "react";

const InstrumentContext = createContext();

export const useInstrument = () => {
  const context = useContext(InstrumentContext);
  if (!context) {
    throw new Error("useInstrument must be used within an InstrumentProvider");
  }
  return context;
};

export const InstrumentProvider = ({ children }) => {
  const [instrument, setInstrument] = useState(null);

  return (
    <InstrumentContext.Provider value={{ instrument, setInstrument }}>
      {children}
    </InstrumentContext.Provider>
  );
};
