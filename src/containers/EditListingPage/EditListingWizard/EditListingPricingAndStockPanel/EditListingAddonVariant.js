import React from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from "react-final-form-arrays";

// Import configs and util modules
import appSettings from '../../../../config/settings';

// Import shared components
import { FieldTextInput, FieldCurrencyInput, IconTrash, Button } from '../../../../components';

import { types as sdkTypes } from '../../../../util/sdkLoader';
const { Money } = sdkTypes;

// Import modules from this directory
import css from './EditListingPricingAndStockForm.module.css';

const EditListingAddonVariant = (props) => {
  const { marketplaceCurrency } = props;

  const addAddonVariant = (fieldArrayProps) => {
    const newAddon = {
      addonLabel: '',  // Initial variant label
      options: [] // Initialize options as an empty array
    };

    // Push the newAddon object into the field array
    fieldArrayProps.fields.push(newAddon);
    console.log('fieldArrayProps.fields.push(newAddon)');
    console.log(fieldArrayProps);
  };

  // Function to remove an addon variant
  const removeAddonVariant = (fieldArrayProps, index) => {
    fieldArrayProps.fields.remove(index);
  };

  // Function to add an option to a specific addon variant
  const addOption = (fieldArrayProps) => {
    const addonVariant = fieldArrayProps.fields;

    // Add a new option to the 'options' array
    addonVariant.push({
      name: '',
      optionLabel: '',
      subOptionLabel: '',
      options: []  // Nested options array
    });
  };

  // Function to add a sub-option to a specific option
  const addSubOption = (optionFieldArrayProps, optionIndex) => {
    const option = optionFieldArrayProps.fields;

    // Ensure the sub-options array is initialized
    // if (!option.options) {
    //   option.options = [];
    // }

    // const addonPrice = new Money;
    // addonPrice.currency = marketplaceCurrency;
    // addonPrice.price = 1;

    // Add a new sub-option to the 'options' array
    option.push({
      subOptionName: '', // Sub-option name (e.g., 1.0 Carat)
    });

    // Update the form state with the modified option
    // optionFieldArrayProps.fields.update(optionIndex, option);
  };

  // Function to remove an option
  const removeOption = (optionFieldArrayProps, optionIndex) => {
    optionFieldArrayProps.fields.remove(optionIndex);
  };

  // Function to remove a sub-option
  const removeSubOption = (subOptionFieldArrayProps, subOptionIndex) => {
    subOptionFieldArrayProps.fields.remove(subOptionIndex);
  };

  console.log(props.priceValidators);

  const testValidator = (test,nex) =>{
    console.log('testValidator');
    console.log(test);
    console.log(nex);
  }

  return (
    <FieldArray name="addonVariant">
      {fieldArrayProps => (
        <>
          {fieldArrayProps.fields.map((name, index) => (
            <div key={name}>
              <hr />
              <h2>
                Addon {index + 1}
                <button
                  className={css.removeButton}
                  type="button"
                  onClick={() => removeAddonVariant(fieldArrayProps, index)}
                >
                  <IconTrash rootClassName={css.IconTrash} />
                </button>
              </h2>

              {/* Variant Label (e.g., Select gem type) */}
              <FieldTextInput
                id={`${name}.addonLabel`}
                name={`${name}.addonLabel`}
                className={css.input} 
                label="Addon Name"
                placeholder="Enter addon name"
                type="text"
              />
              <div className={css.optionsContainer}>
                <FieldArray name={`${name}.options`}>
                  {optionFieldArrayProps => (
                    <>
                      {optionFieldArrayProps.fields.map((optionName, optionIndex) => (
                        <div key={optionName}>
                          <h3>Option {optionIndex + 1}
                            {/* Remove Option Button */}
                            <button
                              className={css.removeButton}
                              type="button"
                              onClick={() => removeOption(optionFieldArrayProps, optionIndex)}
                            >
                              <IconTrash rootClassName={css.IconTrash} />
                            </button>
                          </h3>

                          

                          {/* Option Label (e.g., Select carats) */}
                          <FieldTextInput
                            id={`${optionName}.optionLabel`}
                            name={`${optionName}.optionLabel`}
                            className={css.input} 
                            label="Option Label"
                            placeholder="Enter option label"
                            type="text"
                          />

                          {/* Option Price */}
                          <FieldCurrencyInput
                            id={`${optionName}.price`}
                            name={`${optionName}.price`}
                            className={css.input} 
                            label="Option Price"
                            currencyConfig={appSettings.getCurrencyFormatting(props.marketplaceCurrency)}
                            validate={props.priceValidators}
                          />

                          <FieldTextInput
                            id={`${optionName}.subOptionLabel`}
                            name={`${optionName}.subOptionLabel`}
                            className={css.input} 
                            label="Sub Option Label"
                            placeholder="Enter sub option label"
                            type="text"
                          />

                          {/* Sub-options for the option */}
                          <div className={css.optionsContainer}>
                            <FieldArray name={`${optionName}.options`}>
                              {subOptionFieldArrayProps => (
                                <>
                                  {subOptionFieldArrayProps.fields.map((subOptionName, subOptionIndex) => (
                                    <div key={subOptionName}>
                                      <h4>Sub-option {subOptionIndex + 1}
                                        {/* Remove Sub-option Button */}
                                        <button
                                          className={css.removeButton}
                                          type="button"
                                          onClick={() => removeSubOption(subOptionFieldArrayProps, subOptionIndex)}
                                        >
                                          <IconTrash rootClassName={css.IconTrash} />
                                        </button>
                                      </h4>

                                     

                                      {/* Sub-option Name (e.g., 1.0 Carat) */}
                                      <FieldTextInput
                                        id={`${subOptionName}.subOptionName`}
                                        name={`${subOptionName}.subOptionName`}
                                        className={css.input}
                                        label="Sub-option Name"
                                        placeholder="Enter sub-option name"
                                        type="text"
                                      />

                                      {/* Sub-option Price */}
                                      <FieldCurrencyInput
                                        id={`${subOptionName}.price`}
                                        name={`${subOptionName}.price`}
                                        className={css.input}
                                        label="Sub-option Price"
                                        currencyConfig={appSettings.getCurrencyFormatting(props.marketplaceCurrency)}
                                        validate={props.priceValidators}
                                      />

                                    </div>
                                  ))}

                                  {/* Button to add a new sub-option */}
                                  <div>
                                    <p>
                                      If you want to add a new sub-option, click the button below
                                    </p>
                                  </div>
                                  <Button
                                    className={css.addonOptionButton}
                                    type="button"
                                    onClick={() => addSubOption(subOptionFieldArrayProps, optionIndex)}
                                  >
                                    Add Sub-option
                                  </Button>
                                </>
                              )}
                            </FieldArray>
                          </div>
                           
                        </div>
                      ))}

                      {/* Button to add a new option */}
                      <Button
                        className={css.addonOptionButton}
                        type="button"
                        onClick={() => addOption(optionFieldArrayProps)}
                      >
                        Add Option
                      </Button>
                    </>
                  )}
                </FieldArray>
              </div>
            </div>
          ))}

          {/* Button to add a new addon variant */}
          <Button
            className={css.submitButton}
            type="button"
            onClick={() => addAddonVariant(fieldArrayProps)}
          >
            Add Addon
          </Button>
        </>
      )}
    </FieldArray>
  );
};

export default EditListingAddonVariant;


// {
//   "addonVariant" : [
//     {
//       "variantLabel": "Select gem type",
//       "options": [
//         {
//           "variantLabel": "Diamond",
//           "variantPrice": 300,
//           "optionLabel": "Select carats",
//           "options": [
//             { "name": "1.0 Carat", "price": 500 },
//             { "name": "1.5 Carat", "price": 750 }
//           ]
//         },
//         {
//           "variantLabel": "briliant",
//           "variantPrice": 500,
//           "optionLabel": "Select carats",
//           "options": [
//             { "name": "1.0 Carat", "price": 700 },
//             { "name": "1.5 Carat", "price": 1050 }
//           ]
//         }
//       ]
//     }
//   ]
// }