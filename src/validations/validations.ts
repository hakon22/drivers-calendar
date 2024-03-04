/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';
import { setLocale, ObjectSchema, AnyObject } from 'yup';
import { set } from 'lodash';
import i18n from '../locales';

const { t } = i18n;

setLocale({
  mixed: {
    required: () => t('validation.required'),
    notOneOf: () => t('validation.uniq'),
    oneOf: () => t('validation.mastMatch'),
  },
  string: {
    min: () => t('validation.requirements'),
    max: () => t('validation.requirements'),
    length: () => t('validation.phone'),
  },
});

const validate: any = <T extends ObjectSchema<AnyObject>>(schema: ObjectSchema<T>) => ({
  async validator({ field }: { field: string }, value: unknown) {
    const obj = set({}, field, value);
    await schema.validateSyncAt(field, obj);
  },
});

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .trim()
    .required()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .length(11),
  password: yup
    .string()
    .required(),
});

const userSchema = yup.object().shape({
  phone: yup
    .string()
    .trim()
    .required()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .length(11),
  username: yup
    .string()
    .trim()
    .required()
    .min(3)
    .max(20),
  schedule: yup
    .string()
    .required(),
  color: yup
    .lazy((value) => (typeof value === 'object' ? yup.object().required() : yup.string().required())),
});

const carSchema = yup.object().shape({
  brand: yup
    .string()
    .required(),
  model: yup
    .string()
    .required(),
  inventory: yup
    .number()
    .min(1)
    .required(),
  call: yup
    .number()
    .min(1)
    .required(),
  mileage: yup
    .number()
    .min(1)
    .required(),
  mileage_after_maintenance: yup
    .number()
    .min(1)
    .required(),
  remaining_fuel: yup
    .number()
    .min(1)
    .required(),
  fuel_consumption_summer: yup.object().shape({
    city: yup
      .number()
      .min(1)
      .required(),
    highway: yup
      .number()
      .min(1)
      .required(),
  }),
  fuel_consumption_winter: yup.object().shape({
    city: yup
      .number()
      .min(1)
      .required(),
    highway: yup
      .number()
      .min(1)
      .required(),
  }),
});

export const loginValidation = validate(loginSchema);
export const userValidation = validate(userSchema);
export const carValidation = validate(carSchema);
