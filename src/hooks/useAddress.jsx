import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { doc, updateDoc, getDoc } from 'firebase/firestore';

import { db } from 'db/config';

import { useAuthContext } from 'hooks/useAuthContext';

export const useAddress = () => {
  const { user, addresses, dispatch } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const userRef = doc(db, 'users', user.uid);
  const checkoutSessionRef = doc(db, 'checkoutSessions', user.uid);

  const userAddresses = [...addresses];

  const createAddress = async ({
    id = null,
    name,
    lastName,
    phoneNumber,
    address,
    zipCode,
    city,
    province,
    isMain = false,
    // isFromCheckout = null,
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      // if (isFromCheckout) {
      //   isMain = true;
      // }

      if (!isMain) {
        userAddresses.length === 0 ? (isMain = true) : (isMain = false);
      }

      if (!id) {
        id = uuid();
      }

      const addressToAdd = {
        id,
        name,
        lastName,
        phoneNumber,
        address,
        zipCode,
        city,
        province,
        isMain,
        label: `${name} ${lastName} - ${address} - ${city}, ${zipCode} - ${province}`,
        value: id,
      };

      if (isMain && userAddresses.length > 0) {
        const currentMainAddressIndex = userAddresses.findIndex(
          (address) => address.isMain
        );

        userAddresses[currentMainAddressIndex].isMain = false;

        userAddresses.unshift(addressToAdd);
      } else {
        userAddresses.push(addressToAdd);
      }

      for (let i = 1; i <= userAddresses.length; i++) {
        userAddresses[i - 1].displayOrder = i;
      }

      await updateDoc(userRef, {
        addresses: userAddresses,
      });

      dispatch({ type: 'UPDATE_ADDRESSES', payload: userAddresses });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setError(err);
      setIsLoading(false);
    }
  };

  const editAddress = async ({
    name,
    lastName,
    phoneNumber,
    address,
    zipCode,
    city,
    province,
    isMain,
    id,
    displayOrder,
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      // Check so that there is always at least one address that is default

      if (!isMain) {
        const currentAddressIndex = userAddresses.findIndex(
          (address) => address.id === id
        );

        userAddresses[currentAddressIndex].isMain
          ? (isMain = true)
          : (isMain = false);
      }

      const updatedAddress = {
        id,
        name,
        lastName,
        phoneNumber,
        address,
        zipCode,
        city,
        province,
        isMain,
        label: `${name} ${lastName} - ${address} - ${city}, ${zipCode} - ${province}`,
        value: id,
        displayOrder,
      };

      const checkoutSessionDoc = await getDoc(checkoutSessionRef);

      if (checkoutSessionDoc.exists()) {
        const { shippingAddress } = checkoutSessionDoc.data();
        if (shippingAddress.id === updatedAddress.id) {
          const { isMain, displayOrder, ...updatedShippingAddress } =
            updatedAddress;

          await updateDoc(checkoutSessionRef, {
            shippingAddress: {
              ...updatedShippingAddress,
            },
          });
        }
      }

      let updatedAddresses = [...userAddresses];

      if (isMain) {
        updatedAddresses = userAddresses.filter((address) => address.id !== id);

        const currentMainAddressIndex = updatedAddresses.findIndex(
          (address) => address.isMain
        );

        if (currentMainAddressIndex >= 0) {
          updatedAddresses[currentMainAddressIndex].isMain = false;
        }

        updatedAddresses.unshift(updatedAddress);

        for (let i = 1; i <= updatedAddresses.length; i++) {
          updatedAddresses[i - 1].displayOrder = i;
        }
      } else {
        const addressToEditIndex = updatedAddresses.findIndex(
          (address) => address.id === id
        );

        updatedAddresses[addressToEditIndex] = {
          ...updatedAddress,
        };
      }

      await updateDoc(userRef, {
        addresses: updatedAddresses,
      });

      dispatch({ type: 'UPDATE_ADDRESSES', payload: updatedAddresses });

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setError(err);
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setError(null);
    setIsLoading(true);

    try {
      const checkoutSessionDoc = await getDoc(checkoutSessionRef);

      if (checkoutSessionDoc.exists()) {
        const { shippingAddress } = checkoutSessionDoc.data();
        if (shippingAddress.id === id) {
          await updateDoc(checkoutSessionRef, {
            shippingAddress: {},
          });
        }
      }

      const updatedAddresses = userAddresses.filter(
        (address) => address.id !== id
      );

      if (updatedAddresses.length > 0) {
        for (let i = 1; i <= updatedAddresses.length; i++) {
          updatedAddresses[i - 1].displayOrder = i;
        }

        const checkForMain = updatedAddresses.find((address) => address.isMain);

        if (!checkForMain) {
          updatedAddresses[0].isMain = true;
        }
      }

      await updateDoc(userRef, {
        addresses: updatedAddresses,
      });

      dispatch({ type: 'UPDATE_ADDRESSES', payload: updatedAddresses });

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setError(err);
      setIsLoading(false);
    }
  };

  return { createAddress, editAddress, deleteAddress, isLoading, error };
};
