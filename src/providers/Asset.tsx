import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  useCallback,
  ReactNode
} from 'react'
import { Logger, DDO, MetadataMain } from '@oceanprotocol/lib'
import { PurgatoryData } from '@oceanprotocol/lib/dist/node/ddo/interfaces/PurgatoryData'
import getAssetPurgatoryData from '../utils/purgatory'
import { CancelToken } from 'axios'
import { retrieveDDO } from '../utils/aquarius'
import { getPrice } from '../utils/subgraph'
import { MetadataMarket, ServiceMetadataMarket } from '../@types/MetaData'
import { useWeb3 } from './Web3'
import { useSiteMetadata } from '../hooks/useSiteMetadata'
import { useAddressConfig } from '../hooks/useAddressConfig'
import { BestPrice } from '../models/BestPrice'
import { useCancelToken } from '../hooks/useCancelToken'
import {
  getPublisherFromServiceSD,
  getServiceSD,
  verifyRawServiceSD
} from '../utils/metadata'

interface AssetProviderValue {
  isInPurgatory: boolean
  purgatoryData: PurgatoryData
  ddo: DDO
  did: string
  metadata: MetadataMarket
  title: string
  owner: string
  price: BestPrice
  type: MetadataMain['type']
  error?: string
  refreshInterval: number
  isAssetNetwork: boolean
  loading: boolean
  isVerifyingSD: boolean
  isServiceSelfDescriptionVerified: boolean
  serviceSDVersion: string
  verifiedServiceProviderName: string
  refreshDdo: (token?: CancelToken) => Promise<void>
}

const AssetContext = createContext({} as AssetProviderValue)

const refreshInterval = 10000 // 10 sec.

function AssetProvider({
  asset,
  children
}: {
  asset: string | DDO
  children: ReactNode
}): ReactElement {
  const { appConfig } = useSiteMetadata()

  const { networkId } = useWeb3()
  const [isInPurgatory, setIsInPurgatory] = useState(false)
  const [purgatoryData, setPurgatoryData] = useState<PurgatoryData>()
  const [ddo, setDDO] = useState<DDO>()
  const [did, setDID] = useState<string>()
  const [metadata, setMetadata] = useState<MetadataMarket>()
  const [title, setTitle] = useState<string>()
  const [price, setPrice] = useState<BestPrice>()
  const [owner, setOwner] = useState<string>()
  const [error, setError] = useState<string>()
  const [type, setType] = useState<MetadataMain['type']>()
  const { isDDOWhitelisted } = useAddressConfig()
  const [loading, setLoading] = useState(false)
  const [isAssetNetwork, setIsAssetNetwork] = useState<boolean>()
  const [isVerifyingSD, setIsVerifyingSD] = useState(false)
  const [
    isServiceSelfDescriptionVerified,
    setIsServiceSelfDescriptionVerified
  ] = useState<boolean>()
  const [serviceSDVersion, setServiceSDVersion] = useState<string>()
  const [verifiedServiceProviderName, setVerifiedServiceProviderName] =
    useState<string>()
  const newCancelToken = useCancelToken()
  const fetchDdo = async (token?: CancelToken) => {
    Logger.log('[asset] Init asset, get DDO')
    setLoading(true)
    const ddo = await retrieveDDO(asset as string, token)
    const isWhitelisted = isDDOWhitelisted(ddo)
    if (!ddo) {
      setError(
        `[asset] The DDO for ${asset} was not found in MetadataCache. If you just published a new data set, wait some seconds and refresh this page.`
      )
    } else if (!isWhitelisted) {
      setError(
        `[asset] The DDO for ${asset} can not be retrieved on this portal.`
      )
    } else {
      setError(undefined)
    }
    setLoading(false)
    return isWhitelisted && ddo
  }

  const refreshDdo = async (token?: CancelToken) => {
    setLoading(true)
    const ddo = await fetchDdo(token)
    Logger.debug('[asset] Got DDO', ddo)
    setDDO(ddo)
    setLoading(false)
  }

  //
  // Get and set DDO based on passed DDO or DID
  //
  useEffect(() => {
    if (!asset || !appConfig.metadataCacheUri) return

    let isMounted = true

    async function init() {
      const ddo = await fetchDdo(newCancelToken())
      if (!isMounted) return
      Logger.debug('[asset] Got DDO', ddo)
      setDDO(ddo)
      setDID(asset as string)
    }
    init()
    return () => {
      isMounted = false
    }
  }, [asset, appConfig.metadataCacheUri])

  const setPurgatory = useCallback(async (did: string): Promise<void> => {
    if (!did) return

    try {
      const result = await getAssetPurgatoryData(did)
      const isInPurgatory = result?.did !== undefined
      setIsInPurgatory(isInPurgatory)
      isInPurgatory && setPurgatoryData(result)
    } catch (error) {
      Logger.error(error)
    }
  }, [])

  const checkServiceSD = useCallback(async (ddo: DDO): Promise<void> => {
    if (!ddo) return
    setIsVerifyingSD(true)

    try {
      const { attributes } = ddo.findServiceByType(
        'metadata'
      ) as ServiceMetadataMarket

      const serviceSelfDescription =
        attributes?.additionalInformation?.serviceSelfDescription
      if (
        !serviceSelfDescription ||
        !Object.keys(serviceSelfDescription).length
      ) {
        setIsServiceSelfDescriptionVerified(false)
        setServiceSDVersion(undefined)
        setVerifiedServiceProviderName(undefined)
        return
      }

      const serviceSelfDescriptionContent = serviceSelfDescription?.url
        ? await getServiceSD(serviceSelfDescription?.url)
        : serviceSelfDescription?.raw
      const { verified, complianceApiVersion } = await verifyRawServiceSD(
        serviceSelfDescriptionContent
      )
      setIsServiceSelfDescriptionVerified(
        verified && !!serviceSelfDescriptionContent
      )
      setServiceSDVersion(complianceApiVersion)
      const serviceProviderName = await getPublisherFromServiceSD(
        serviceSelfDescriptionContent
      )
      setVerifiedServiceProviderName(serviceProviderName)
    } catch (error) {
      setIsServiceSelfDescriptionVerified(false)
      setServiceSDVersion(undefined)
      setVerifiedServiceProviderName(undefined)
      Logger.error(error)
    } finally {
      setIsVerifyingSD(false)
    }
  }, [])

  const initMetadata = useCallback(
    async (ddo: DDO): Promise<void> => {
      if (!ddo) return
      setLoading(true)
      // Get metadata from DDO
      const { attributes } = ddo.findServiceByType(
        'metadata'
      ) as ServiceMetadataMarket
      setMetadata(attributes)
      setTitle(attributes?.main.name)
      setType(attributes.main.type)
      setOwner(ddo.publicKey[0].owner)

      Logger.log('[asset] Got Metadata from DDO', attributes)

      setIsInPurgatory(ddo.isInPurgatory === 'true')
      await setPurgatory(ddo.id)
      setLoading(false)

      // load price
      const returnedPrice = await getPrice(ddo)
      if (
        appConfig.allowDynamicPricing !== 'true' &&
        returnedPrice.type === 'pool'
      ) {
        setError(
          `[asset] The asset ${ddo.id} can not be displayed on this market.`
        )
        setDDO(undefined)
        setLoading(false)
        return
      }
      setPrice({ ...returnedPrice })
    },
    [appConfig.allowDynamicPricing, setPurgatory]
  )

  useEffect(() => {
    if (!ddo) return
    initMetadata(ddo)
    checkServiceSD(ddo)
  }, [ddo, checkServiceSD, initMetadata])

  // Check user network against asset network
  useEffect(() => {
    if (!networkId || !ddo) return

    const isAssetNetwork = networkId === ddo?.chainId
    setIsAssetNetwork(isAssetNetwork)
  }, [networkId, ddo])

  return (
    <AssetContext.Provider
      value={
        {
          ddo,
          did,
          metadata,
          title,
          owner,
          price,
          type,
          error,
          isInPurgatory,
          purgatoryData,
          refreshInterval,
          loading,
          isVerifyingSD,
          refreshDdo,
          isAssetNetwork,
          isServiceSelfDescriptionVerified,
          serviceSDVersion,
          verifiedServiceProviderName
        } as AssetProviderValue
      }
    >
      {children}
    </AssetContext.Provider>
  )
}

// Helper hook to access the provider values
const useAsset = (): AssetProviderValue => useContext(AssetContext)

export { AssetProvider, useAsset, AssetProviderValue, AssetContext }
export default AssetProvider
