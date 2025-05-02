import React, { useEffect, useState } from 'react';

const Toast = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration]);

  if (!visible || !message) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
};

export default Toast;
