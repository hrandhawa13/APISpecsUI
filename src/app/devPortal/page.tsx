"use client";
import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css"; // Swagger UI styles
import YAML from "js-yaml";

export default function DevPortal() {
  const [apiSpecs, setApiSpecs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [swaggerData, setSwaggerData] = useState<any | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  // Fetch API Specs from your server
  useEffect(() => {
    let data;
    const fetchApiSpecs = async () => {
      try {
        const response = await fetch("/api/getApiSpecs");
        if (!response.ok) {
          throw new Error("Failed to fetch API specs");
        }
        data = await response.json();
        console.log(data);
        setApiSpecs(data);
        setSelectedSpec(data[1]?.specName);
        parseYamlToJson(data[1]?.content);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApiSpecs();
  }, []);

  // Parse the YAML content into JSON for Swagger UI
  const parseYamlToJson = (yamlContent: string) => {
    try {
      const jsonContent = YAML.load(yamlContent); // Parse YAML to JSON object
      setSwaggerData(jsonContent); // Set the parsed Swagger JSON data
    } catch (e) {
      console.error("Error parsing YAML:", e);
      setError("Invalid YAML content");
    }
  };

  // Handle API spec selection (trigger Swagger UI rendering)
  const handleSpecClick = (specName: string) => {
    setSelectedSpec(selectedSpec === specName ? null : specName);
    const spec = apiSpecs.find((spec) => spec.specName === specName);
    if (spec) {
      parseYamlToJson(spec.content); // Parse the YAML and set data
    }
  };

  // Render loading state, errors, and API specs list
  if (loading) return <p>Loading API specs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>This is the dev portal Page</h1>
      <div>
        <h2>Available API Specs</h2>
        <ul>
          {apiSpecs.map(
            (spec) =>
              spec.content.trim() !== "" && (
                <li
                  key={spec.specName}
                  style={{
                    cursor: "pointer",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleSpecClick(spec.specName)}
                >
                  {spec.specName.split("/").pop()}
                </li>
              )
          )}
        </ul>
      </div>

      {/* Render Swagger UI only after it's selected and parsed */}
      {selectedSpec && swaggerData && (
        <div>
          <h3>{selectedSpec}</h3>
          <SwaggerUIWrapper spec={swaggerData} />
        </div>
      )}
    </div>
  );
}

const SwaggerUIWrapper = ({ spec }: { spec: any }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent rendering Swagger UI before the component is mounted
  }

  return (
    <div>
      <SwaggerUI spec={spec} url={undefined} />
    </div>
  );
};
