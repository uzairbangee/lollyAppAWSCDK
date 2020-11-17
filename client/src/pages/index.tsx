import { navigate } from "gatsby";
import React from "react"
import Layout from "../components/Layout"
import Lolly from '../components/Lolly'
import {Link} from 'gatsby';

export default function Home() {
  return (
    <Layout>
      <p>Customize and Order your Favourite Popsticle Sticks</p>
      <div className="listLollies">
        <div>
          <Lolly fillLollyTop="#d52358" fillLollyMiddle="#e95946" fillLollyBottom="#deaa43"  />
        </div>
      </div>
      <Link to="/createNew">
        <input type="button" value="Create Now" className="button_order"></input>
      </Link>
    </Layout>

  );
}