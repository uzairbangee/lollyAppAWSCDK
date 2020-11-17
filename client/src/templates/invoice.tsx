import React, {useEffect} from 'react'
import { graphql } from 'gatsby';
import Layout from "../components/Layout"
import Lolly from "../components/Lolly"

export const query = graphql`
    query MyQuery($id: ID!){
        lolly{
            getLollyByID(id: $id){
                to
                from
                message
                id
                flavourMiddle
                flavourTop
                flavourBottom
            }
        }
    }
`

const Invoice = ({data}) => {
    const {getLollyByID} = data.lolly

    return (
        <Layout>
            <p>Lolly from your friend </p>
            <div className="lollyFormDiv">
                <div>
                    <Lolly fillLollyTop={getLollyByID.flavourTop} fillLollyMiddle={getLollyByID.flavourMiddle} fillLollyBottom={getLollyByID.flavourBottom} />
                </div>
                <div className="invoice">
                    <h4 className="invoice_head">Lolly</h4>
                    <p>{getLollyByID.to}</p>
                    <p>{getLollyByID.message}</p>
                    <p>{getLollyByID.from}</p>
                </div>
            </div>
        </Layout>
    )
}

export default Invoice;