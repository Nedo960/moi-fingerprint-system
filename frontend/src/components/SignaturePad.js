import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import SignaturePadLib from 'signature_pad';

const SignaturePad = forwardRef(({ label }, ref) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgba(255,255,255,0)',
      penColor: '#1a3a5c'
    });

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      padRef.current.clear();
    };

    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty(),
    toDataURL: () => padRef.current?.toDataURL(),
    clear: () => padRef.current?.clear()
  }));

  return (
    <div>
      {label && <div style={{ marginBottom: 6, fontWeight: 600, fontSize: 14 }}>{label}</div>}
      <div className="sig-pad-container">
        <canvas
          ref={canvasRef}
          style={{ height: 160, width: '100%', display: 'block' }}
        />
        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>وقّع بإصبعك أو الماوس في المربع أعلاه</div>
        <button
          type="button"
          onClick={() => padRef.current?.clear()}
          className="btn btn-secondary"
          style={{ marginTop: 8, padding: '4px 14px', fontSize: 12 }}
        >
          مسح التوقيع
        </button>
      </div>
    </div>
  );
});

export default SignaturePad;
