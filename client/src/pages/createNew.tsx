import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useRef, useState } from "react"
import Layout from "../components/Layout"
import Lolly from "../components/Lolly"
import LollyColorBox from "../components/LollyColorBox"
import { Formik, Form, ErrorMessage, Field } from 'formik';
import * as Yup from 'yup';
import TextField from '@material-ui/core/TextField';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { navigate } from "gatsby"

const createLollyMutation = gql`
    mutation createLolly($to: String!, $message: String!, $from: String!, $flavourTop: String!, $flavourMiddle: String!,$flavourBottom: String!) {
        createLolly(to: $to, message: $message, from: $from, flavourTop: $flavourTop, flavourMiddle: $flavourMiddle,flavourBottom: $flavourBottom) {
            id
        }
    }
`

const formSchema = Yup.object().shape({
    to: Yup.string()
        .required('Required'),
    message: Yup.string()
        .required('Required'),
    from: Yup.string()
        .required('Required')
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      margin: '20px 0',
      color: 'white',
      display: 'block'
    }
  }),
);

export default function CreateNew() {
    const [color1, setColor1] = useState("#d52358");
    const [color2, setColor2] = useState("#e95946");
    const [color3, setColor3] = useState("#deaa43");
    const classes = useStyles();
    const [createLolly] = useMutation(createLollyMutation);

  return (
    <Layout>

            <p>Customize and Order your Favourite Popsticle Sticks</p>
            <div className="lollyFormDiv">
                <div>
                    <Lolly fillLollyTop={color1} fillLollyMiddle={color2} fillLollyBottom={color3} />
                </div>
                <LollyColorBox
                    color1={color1}
                    color2={color2}
                    color3={color3}
                    setColor1={setColor1}
                    setColor2={setColor2}
                    setColor3={setColor3}
                />
                <div>
                    <Formik 
                        initialValues={ {
                            to: "",
                            message: "",
                            from: ""
                        }} 
                        validationSchema={formSchema}
                        onSubmit = { async (values, {resetForm}) => {
                            const result = await createLolly({
                                variables : {
                                    to: values.to,
                                    message: values.message,
                                    from: values.from,
                                    flavourTop: color1,
                                    flavourMiddle: color2,
                                    flavourBottom: color3
                                }
                            })
                            resetForm({values: {
                                to: "",
                                message: "",
                                from: ""
                                }
                            });
                            navigate(`/lolly/${result.data.createLolly.id}`);
                        }}
                    >
                        {
                            (formik) => (
                                <Form onSubmit={formik.handleSubmit}>
                                    <div>
                                    <Field type="text" as={TextField} classes={{root: classes.textField}} variant="outlined" label="To" name="to" id="to"/>
                                        <ErrorMessage name="to" render={(msg)=>(
                                            <span style={{color:"coral",display: 'block',width: '100px'}}>{msg}</span>
                                        )} />
                                    </div>

                                    <div>
                                    <Field type="text" as={TextField} multiline rows={3} variant="outlined" classes={{root: classes.textField}} label="Message" name="message" id="message"/>
                                        <ErrorMessage name="message" render={(msg)=>(
                                            <span style={{color:"coral",display: 'block',width: '100px'}}>{msg}</span>
                                        )} />
                                    </div>

                                    <div>
                                    <Field type="text" as={TextField} classes={{root: classes.textField}} variant="outlined" label="From" name="from" id="from"/>
                                        <ErrorMessage name="from" render={(msg)=>(
                                            <span style={{color:"coral",display: 'block',width: '100px'}}>{msg}</span>
                                        )} />
                                    </div>

                                    <div>
                                        <button type="submit" className="button_order">Send</button>
                                    </div>
                                </Form>
                            )
                        }
                    </Formik>
                </div>
            </div>
    </Layout>
  );
}