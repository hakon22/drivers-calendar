/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';
import { setLocale, ObjectSchema, AnyObject } from 'yup';
import _ from 'lodash';
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
    const obj = _.set({}, field, value);
    await schema.validateSyncAt(field, obj);
  },
  async serverValidator(data: typeof schema) {
    await schema.validate(data);
  },
});

const numberSchema = yup.number().min(1).required();
const stringSchema = yup.string().required();

const phoneSchema = yup.string().trim().required().transform((value) => value.replace(/[^\d]/g, ''))
  .length(11)
  .matches(/^79.../, t('validation.phone'));

const confirmCodeSchema = yup.object().shape({
  code: stringSchema
    .transform((value) => value.replace(/[^\d]/g, ''))
    .test('code', t('validation.code'), (value) => value.length === 4),
});

const confirmPhoneSchema = yup.object().shape({
  phone: phoneSchema,
});

const loginSchema = yup.object().shape({
  phone: phoneSchema,
  password: stringSchema,
});

const userSchema = yup.object().shape({
  phone: phoneSchema,
  username: stringSchema
    .trim()
    .min(3)
    .max(20),
  schedule: stringSchema.matches(/2\/2|1\/2|1\/3/, t('validation.incorrectSchedule')),
  color: yup
    .lazy((value) => (typeof value === 'object'
      ? yup.object()
        .required()
      : yup.string()
        .required()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('validation.incorrectColor'))
    )),
});

const userInviteSchema = yup.object().shape({
  phone: phoneSchema,
  username: stringSchema
    .trim()
    .min(3)
    .max(20),
  color: yup
    .lazy((value) => (typeof value === 'object'
      ? yup.object()
        .required()
      : yup.string()
        .required()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('validation.incorrectColor'))
    )),
});

const fuelConsumptionSchema = yup.object().shape({
  city: numberSchema,
  highway: numberSchema,
});

const carSchema = yup.object().shape({
  brand: stringSchema,
  model: stringSchema,
  inventory: stringSchema,
  call: stringSchema,
  mileage: numberSchema,
  mileage_after_maintenance: numberSchema,
  remaining_fuel: numberSchema,
  fuel_consumption_summer: fuelConsumptionSchema,
  fuel_consumption_winter: fuelConsumptionSchema,
});

export const confirmCodeValidation = validate(confirmCodeSchema);
export const phoneValidation = validate(confirmPhoneSchema);
export const loginValidation = validate(loginSchema);
export const userValidation = validate(userSchema);
export const userInviteValidation = validate(userInviteSchema);
export const carValidation = validate(carSchema);
