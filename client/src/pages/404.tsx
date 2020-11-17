import React, {useEffect} from 'react'
import Layout from "../components/Layout"
import { gql, useQuery } from "@apollo/client";
import Lolly from "../components/Lolly"


const RUNTIME = gql`
    query getLollyByID($id: ID!){
        getLollyByID(id: $id) {
            to
            from
            message
            id
            flavourMiddle
            flavourTop
            flavourBottom
        }
    }
`

export default ({location}) => {
    const path_name = location.pathname.split('/')[2];
    console.log(path_name)
    const {loading, error, data} = useQuery(RUNTIME, {
        variables : {
            id: path_name
        }
    })

    return (
        <Layout>
            {
                !data || error &&
                <p>Sorry on wrong page</p>
            }
            {
                loading
                &&
                <p>Getting lolly Ready...</p>
            }
            {
                data &&
                <>
                <p>Lolly from your friend </p>
                <div className="lollyFormDiv">
                    <div>
                        <Lolly fillLollyTop={data.getLollyByID.flavourTop} fillLollyMiddle={data.getLollyByID.flavourMiddle} fillLollyBottom={data.getLollyByID.flavourBottom} />
                    </div>
                    <div className="invoice">
                        <h4 className="invoice_head">Lolly</h4>
                        <p>{data.getLollyByID.to}</p>
                        <p>{data.getLollyByID.message}</p>
                        <p>{data.getLollyByID.from}</p>
                    </div>
                </div>
                </>
            }
        </Layout>
    )
}