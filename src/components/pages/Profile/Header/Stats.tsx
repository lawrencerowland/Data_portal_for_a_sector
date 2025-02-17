import { Logger } from '@oceanprotocol/lib'
import React, { useEffect, useState } from 'react'
import { ReactElement } from 'react-markdown'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import {
  getAccountLiquidityInOwnAssets,
  getAssetsBestPrices,
  UserLiquidity,
  calculateUserLiquidity
} from '../../../../utils/subgraph'
import Conversion from '../../../atoms/Price/Conversion'
import NumberUnit from '../../../molecules/NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '../../../../providers/Profile'
import { PoolShares_poolShares as PoolShare } from '../../../../@types/apollo/PoolShares'

async function getPoolSharesLiquidity(
  poolShares: PoolShare[]
): Promise<number> {
  let totalLiquidity = 0

  for (const poolShare of poolShares) {
    const poolLiquidity = calculateUserLiquidity(poolShare)
    totalLiquidity += poolLiquidity
  }

  return totalLiquidity
}

export default function Stats({
  accountId,
  showLiquidity
}: {
  accountId: string
  showLiquidity?: boolean
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { poolShares, assets, assetsTotal, sales } = useProfile()

  const [publisherLiquidity, setPublisherLiquidity] = useState<UserLiquidity>()
  const [totalLiquidity, setTotalLiquidity] = useState(0)

  useEffect(() => {
    if (!accountId || chainIds.length === 0) {
      setPublisherLiquidity({ price: '0', oceanBalance: '0' })
      setTotalLiquidity(0)
    }
  }, [accountId, chainIds])

  useEffect(() => {
    if (!assets || !accountId || !chainIds) return

    async function getPublisherLiquidity() {
      try {
        const accountPoolAdresses: string[] = []
        const assetsPrices = await getAssetsBestPrices(assets)
        for (const priceInfo of assetsPrices) {
          if (priceInfo.price.type === 'pool') {
            accountPoolAdresses.push(priceInfo.price.address.toLowerCase())
          }
        }
        const userLiquidity = await getAccountLiquidityInOwnAssets(
          accountId,
          chainIds,
          accountPoolAdresses
        )
        setPublisherLiquidity(userLiquidity)
      } catch (error) {
        Logger.error(error.message)
      }
    }
    getPublisherLiquidity()
  }, [assets, accountId, chainIds])

  useEffect(() => {
    if (!poolShares) return

    async function getTotalLiquidity() {
      try {
        const totalLiquidity = await getPoolSharesLiquidity(poolShares)
        setTotalLiquidity(totalLiquidity)
      } catch (error) {
        console.error('Error fetching pool shares: ', error.message)
      }
    }
    getTotalLiquidity()
  }, [poolShares])

  return (
    <div className={styles.stats}>
      {showLiquidity && (
        <>
          <NumberUnit
            label="Liquidity in Own Assets"
            value={
              <Conversion
                price={publisherLiquidity?.price}
                hideApproximateSymbol
              />
            }
          />
          <NumberUnit
            label="Total Liquidity"
            value={
              <Conversion price={`${totalLiquidity}`} hideApproximateSymbol />
            }
          />
        </>
      )}
      <NumberUnit label={`Sale${sales === 1 ? '' : 's'}`} value={sales} />
      <NumberUnit label="Published" value={assetsTotal} />
    </div>
  )
}
