import React, { ReactElement, useEffect, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Markdown from '../../atoms/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Pricing from './Pricing'
import Bookmark from './Bookmark'
import { useAsset } from '../../../providers/Asset'
import Alert from '../../atoms/Alert'
import Button from '../../atoms/Button'
import Edit from '../AssetActions/Edit'
import EditComputeDataset from '../AssetActions/Edit/EditComputeDataset'
import DebugOutput from '../../atoms/DebugOutput'
import MetaMain from './MetaMain'
import EditHistory from './EditHistory'
import { useWeb3 } from '../../../providers/Web3'
import styles from './index.module.css'
import EditAdvancedSettings from '../AssetActions/Edit/EditAdvancedSettings'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import NetworkName from '../../atoms/NetworkName'
import { getFormattedCodeString, getServiceSD } from '../../../utils/metadata'

const contentQuery = graphql`
  query AssetContentQuery {
    purgatory: allFile(filter: { relativePath: { eq: "purgatory.json" } }) {
      edges {
        node {
          childContentJson {
            asset {
              title
              description
            }
          }
        }
      }
    }
  }
`

export default function AssetContent({ path }: { path: string }): ReactElement {
  const data = useStaticQuery(contentQuery)
  const content = data.purgatory.edges[0].node.childContentJson.asset
  const { debug } = useUserPreferences()
  const { accountId } = useWeb3()
  const {
    ddo,
    isAssetNetwork,
    isInPurgatory,
    isServiceSelfDescriptionVerified,
    metadata,
    owner,
    price,
    purgatoryData,
    type
  } = useAsset()
  const [showPricing, setShowPricing] = useState(false)
  const [showEdit, setShowEdit] = useState<boolean>()
  const [isComputeType, setIsComputeType] = useState<boolean>(false)
  const [showEditCompute, setShowEditCompute] = useState<boolean>()
  const [showEditAdvancedSettings, setShowEditAdvancedSettings] =
    useState<boolean>()
  const [isOwner, setIsOwner] = useState(false)
  const [serviceSelfDescription, setServiceSelfDescription] = useState<string>()
  const { appConfig } = useSiteMetadata()

  useEffect(() => {
    if (!accountId || !owner) return

    const isOwner = accountId.toLowerCase() === owner.toLowerCase()
    setIsOwner(isOwner)
    setShowPricing(isOwner && price?.type === '')
    setIsComputeType(Boolean(ddo.findServiceByType('compute')))
  }, [accountId, price, owner, ddo])

  function handleEditButton() {
    // move user's focus to top of screen
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEdit(true)
  }

  function handleEditComputeButton() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEditCompute(true)
  }

  function handleEditAdvancedSettingsButton() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setShowEditAdvancedSettings(true)
  }

  useEffect(() => {
    if (!isServiceSelfDescriptionVerified) return
    const serviceSD = metadata?.additionalInformation?.serviceSelfDescription
    if (serviceSD?.raw) {
      const formattedServiceSelfDescription = `## Service Self-Description\n${getFormattedCodeString(
        JSON.parse(serviceSD?.raw)
      )}`
      setServiceSelfDescription(formattedServiceSelfDescription)
    }
    if (serviceSD?.url) {
      getServiceSD(serviceSD?.url).then((serviceSelfDescription) => {
        const formattedServiceSelfDescription = `## Service Self-Description\n${getFormattedCodeString(
          JSON.parse(serviceSelfDescription)
        )}`
        setServiceSelfDescription(formattedServiceSelfDescription)
      })
    }
  }, [
    isServiceSelfDescriptionVerified,
    metadata?.additionalInformation?.serviceSelfDescription
  ])

  return showEdit ? (
    <Edit setShowEdit={setShowEdit} isComputeType={isComputeType} />
  ) : showEditCompute ? (
    <EditComputeDataset setShowEdit={setShowEditCompute} />
  ) : showEditAdvancedSettings ? (
    <EditAdvancedSettings setShowEdit={setShowEditAdvancedSettings} />
  ) : (
    <>
      <div className={styles.networkWrap}>
        <NetworkName networkId={ddo.chainId} className={styles.network} />
      </div>

      <article className={styles.grid}>
        <div>
          {showPricing && <Pricing ddo={ddo} />}
          <div className={styles.content}>
            <MetaMain />
            <Bookmark did={ddo.id} />
            <div className={styles.contentBody}>
              {isInPurgatory ? (
                <Alert
                  title={content.title}
                  badge={`Reason: ${purgatoryData?.reason}`}
                  text={content.description}
                  state="error"
                />
              ) : (
                <>
                  <Markdown
                    className={styles.description}
                    text={metadata?.additionalInformation?.description || ''}
                  />
                  {isServiceSelfDescriptionVerified && (
                    <Markdown
                      className={styles.description}
                      text={serviceSelfDescription || ''}
                    />
                  )}

                  <MetaSecondary />

                  {isOwner && isAssetNetwork && (
                    <div className={styles.ownerActions}>
                      <Button
                        style="text"
                        size="small"
                        onClick={handleEditButton}
                      >
                        Edit Metadata
                      </Button>
                      {accountId && appConfig.allowAdvancedSettings === 'true' && (
                        <>
                          <span className={styles.separator}>|</span>
                          <Button
                            style="text"
                            size="small"
                            onClick={handleEditAdvancedSettingsButton}
                          >
                            Edit Advanced Settings
                          </Button>
                        </>
                      )}
                      {ddo.findServiceByType('compute') && type === 'dataset' && (
                        <>
                          <span className={styles.separator}>|</span>
                          <Button
                            style="text"
                            size="small"
                            onClick={handleEditComputeButton}
                          >
                            Edit Compute Settings
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              <MetaFull />
              <EditHistory />
            </div>
            {debug === true && <DebugOutput title="DDO" output={ddo} />}
          </div>
        </div>
        <div className={styles.actions}>
          <AssetActions />
        </div>
      </article>
    </>
  )
}
