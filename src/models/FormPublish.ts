import {
  MetadataPublishFormDataset,
  ServiceSelfDescription
} from '../@types/MetaData'
import { File as FileMetadata } from '@oceanprotocol/lib'
import * as Yup from 'yup'

export const validationSchema: Yup.SchemaOf<MetadataPublishFormDataset> =
  Yup.object()
    .shape({
      // ---- required fields ----
      name: Yup.string()
        .min(4, (param) => `Title must be at least ${param.min} characters`)
        .required('Required'),
      author: Yup.string().required('Required'),
      dataTokenOptions: Yup.object()
        .shape({
          name: Yup.string(),
          symbol: Yup.string()
        })
        .required('Required'),
      files: Yup.array<FileMetadata>()
        .required('Enter a valid URL and click "ADD FILE"')
        .nullable(),
      description: Yup.string().min(10).required('Required'),
      timeout: Yup.string().required('Required'),
      access: Yup.string()
        .matches(/Compute|Download/g, { excludeEmptyString: true })
        .required('Required'),
      noPersonalData: Yup.boolean()
        .oneOf([true], 'Field must be checked')
        .required('Required'),
      // ---- optional fields ----
      termsAndConditions: Yup.boolean(),
      tags: Yup.string().nullable(),
      links: Yup.array<FileMetadata[]>().nullable(),
      providerUri: Yup.string().url().nullable(),
      serviceSelfDescription: Yup.array<ServiceSelfDescription[]>().nullable()
    })
    .defined()

export const initialValues: Partial<MetadataPublishFormDataset> = {
  name: '',
  author: '',
  dataTokenOptions: {
    name: '',
    symbol: ''
  },
  files: '',
  serviceSelfDescription: '',
  description: '',
  timeout: 'Forever',
  access: '',
  termsAndConditions: false,
  noPersonalData: false,
  tags: '',
  providerUri: ''
}
