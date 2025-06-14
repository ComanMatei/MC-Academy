import React, { useEffect, useRef } from 'react';
import DialogCSS from './dialog.module.css';
import { useNavigate } from 'react-router-dom';

const RegisterDialog = ({ isOpen, onClose }) => {
  const dialogRef = useRef(null);

  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog) {
      dialog.showModal();
    } else if (!isOpen && dialog?.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className={DialogCSS.dialogNative} onClose={onClose}>
      <h2>Registration Successful!</h2>
      <p>Please check your email inbox to activate your account!</p>
      <button onClick={handleGoToLogin} className={DialogCSS.closeButton}>Back to Log In</button>
    </dialog>
  );
};

export default RegisterDialog;
