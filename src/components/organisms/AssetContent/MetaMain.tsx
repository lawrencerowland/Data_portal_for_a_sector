import React, { ReactElement } from 'react'
import { useAsset } from '../../../providers/Asset'
import { useWeb3 } from '../../../providers/Web3'
import ExplorerLink from '../../atoms/ExplorerLink'
import Publisher from '../../atoms/Publisher'
import AddToken from '../../atoms/AddToken'
import Time from '../../atoms/Time'
import AssetType from '../../atoms/AssetType'
import styles from './MetaMain.module.css'
import VerifiedBadge from '../../atoms/VerifiedBadge'

export default function MetaMain(): ReactElement {
  const {
    ddo,
    owner,
    type,
    isAssetNetwork,
    isServiceSelfDescriptionVerified,
    serviceSDVersion,
    isVerifyingSD,
    verifiedServiceProviderName
  } = useAsset()
  const { web3ProviderInfo } = useWeb3()

  const isCompute = Boolean(ddo?.findServiceByType('compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const blockscoutNetworks = [1287, 2021000, 2021001, 44787, 246, 1285]
  const isBlockscoutExplorer = blockscoutNetworks.includes(ddo?.chainId)

  return (
    <aside className={styles.meta}>
      <header className={styles.asset}>
        <AssetType
          type={type}
          accessType={accessType}
          className={styles.assetType}
        />
        <ExplorerLink
          className={styles.datatoken}
          networkId={ddo?.chainId}
          path={
            isBlockscoutExplorer
              ? `tokens/${ddo?.dataToken}`
              : `token/${ddo?.dataToken}`
          }
        >
          {`${ddo?.dataTokenInfo.name} — ${ddo?.dataTokenInfo.symbol}`}
        </ExplorerLink>

        {web3ProviderInfo?.name === 'MetaMask' && isAssetNetwork && (
          <span className={styles.addWrap}>
            <AddToken
              address={ddo?.dataTokenInfo.address}
              symbol={ddo?.dataTokenInfo.symbol}
              logo="https://raw.githubusercontent.com/oceanprotocol/art/main/logo/datatoken.png"
              text={`Add ${ddo?.dataTokenInfo.symbol} to wallet`}
              className={styles.add}
              minimal
            />
          </span>
        )}
      </header>

      <div className={styles.publisherInfo}>
        <div className={styles.byline}>
          Published By{' '}
          <Publisher
            account={owner}
            verifiedServiceProviderName={
              isServiceSelfDescriptionVerified && verifiedServiceProviderName
            }
          />
          <p>
            <Time date={ddo?.created} relative />
            {ddo?.created !== ddo?.updated && (
              <>
                {' — '}
                <span className={styles.updated}>
                  updated <Time date={ddo?.updated} relative />
                </span>
              </>
            )}
          </p>
        </div>
        {(isVerifyingSD || isServiceSelfDescriptionVerified) && (
          <div className={styles.verifiedBadgeContainer}>
            <VerifiedBadge
              text="Service Self-Description"
              isLoading={isVerifyingSD}
              apiVersion={serviceSDVersion}
              timestamp={isServiceSelfDescriptionVerified}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
