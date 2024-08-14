import { useEffect, useState } from "react";

const GQL_Endpoint = `https://graphql.contentful.com/content/v1/spaces/${
  import.meta.env.VITE_Space_ID
}`;

const FETCH_QUERY = `
query GetAssessmentDetails {
  assessmentCollection {
    items {
      name
      slug
      intro {
        json
      }
      questions
      resultsIntro {
        json
      }
    }
  }
}
`;

const useGetFormData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(GQL_Endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_Access_Token}`,
        },
        body: JSON.stringify({ query: FETCH_QUERY }),
      });

      const data = await response.json();
      setData(data.data);
    };

    setIsLoading(true);
    try {
      fetchData().then(() => {
        setIsLoading(false);
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, data };
};

export default useGetFormData;
