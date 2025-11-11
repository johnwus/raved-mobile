import React from 'react';
import { View } from 'react-native';
import { Toast } from '../ui/Toast';
import { useToastStore } from '../../store/toastStore';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { visible, message, type, hideToast } = useToastStore();

  return (
    <>
      {children}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
        <Toast
          visible={visible}
          message={message}
          type={type}
          onHide={hideToast}
        />
      </View>
    </>
  );
};

