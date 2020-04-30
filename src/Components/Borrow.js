import React from 'react'

export default function Borrow(props) {
  const { setStep } = props;
  return (
    <div>
      Borrow
      <button onClick={() => setStep(0)}>Back</button>
    </div>
  )
}
