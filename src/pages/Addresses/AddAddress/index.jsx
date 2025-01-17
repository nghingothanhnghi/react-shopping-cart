import { useState, useEffect, useRef } from 'react';

import { useAddress } from 'hooks/useAddress';
import { useKeyDown } from 'hooks/useKeyDown';

import Loader from 'components/Loader';
import Toast from 'components/Toast';
import ToastMessage from 'components/ToastMessage';

import styles from './index.module.scss';

const AddAddress = ({ toggleAddAddressModal }) => {
  const { createAddress, isLoading, error } = useAddress();

  const [isChecked, setIsChecked] = useState(false);
  const [notification, setNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleCheckboxInput = () => {
    setIsChecked((prevState) => !prevState);
  };

  const nameInput = useRef();
  const lastNameInput = useRef();
  const phoneNumberInput = useRef();
  const addressInput = useRef();
  const zipCodeInput = useRef();
  const cityInput = useRef();
  const provinceInput = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAddress({
      name: nameInput.current.value,
      lastName: lastNameInput.current.value,
      phoneNumber: phoneNumberInput.current.value,
      address: addressInput.current.value,
      zipCode: zipCodeInput.current.value,
      city: cityInput.current.value,
      province: provinceInput.current.value,
      isMain: isChecked,
    });

    setNotification(true);
  };

  useEffect(() => {
    if (notification) {
      if (error) {
        setToastMessage({ error, details: error.details });
        setNotification(false);
      } else {
        toggleAddAddressModal();
      }
    }
  }, [notification]);

  const toggleToast = () => {
    setToastMessage(null);
  };

  useKeyDown(() => {
    toggleAddAddressModal();
  }, ['Escape']);

  return (
    <>
      <Toast>
        {toastMessage && (
          <ToastMessage toggleToast={toggleToast} content={toastMessage} />
        )}
      </Toast>
      {isLoading && (
        <Loader noPortal={true} wrapperClassName={styles.loader_wrapper} />
      )}
      {!isLoading && (
        <form id="form" className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.title}>Add Address:</h2>
          <div className={styles.form_inputs_wrapper}>
            <label className={styles.label}>
              <span>Name:</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Name"
                required
                ref={nameInput}
              />
            </label>
            <label className={styles.label}>
              <span>Last Name:</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Last Name"
                required
                ref={lastNameInput}
              />
            </label>
            <label className={styles.label}>
              <span>Phone:</span>
              <input
                className={styles.input}
                type="tel"
                required
                ref={phoneNumberInput}
              />
            </label>
            <label className={styles.label}>
              <span>Address:</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Address"
                required
                ref={addressInput}
              />
            </label>
            <label className={styles.label}>
              <span>City:</span>
              <input
                className={styles.input}
                type="text"
                placeholder="City"
                required
                ref={cityInput}
              />
            </label>
            <label className={styles.label}>
              <span>Zip Code:</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Zip Code"
                inputMode="nuAddAddressModalmeric"
                required
                ref={zipCodeInput}
              />
            </label>

            <label className={styles.label}>
              <span>State</span>
              <input
                className={styles.input}
                type="text"
                placeholder="State"
                required
                ref={provinceInput}
              />
            </label>
            <label className={styles.checkbox}>
              <input
                className={styles.input}
                type="checkbox"
                onChange={handleCheckboxInput}
              />
              <div>Primary Address</div>
            </label>
          </div>
          <div className={styles.button_wrapper}>
            <button form="form" className={styles.button} type="submit">
              Add
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default AddAddress;
