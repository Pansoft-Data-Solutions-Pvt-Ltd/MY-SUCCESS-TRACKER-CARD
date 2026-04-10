import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  DropdownButtonItem,
} from "@ellucian/react-design-system/core";

const HomeHeader = ({
  currentTerm,
  termCodesResult,
  blockedTermCodes,
  loadingTermCodes,
  handleTermChange,
}) => {
  const backHref = useMemo(() => {
    const segments = window?.location?.pathname?.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `${window.location.origin}/${segments[0]}/`;
    }
    return window.location.origin;
  }, []);

  const handleBack = () => {
    window.location.assign(backHref);
  };

  return (
    <div className="card-header">
      <div className="back-button-wrapper">
        <Button color="secondary" onClick={handleBack}>
          Back
        </Button>
      </div>

      <div>
        <Typography
          variant="h4"
          className="card-title"
          style={{ fontWeight: 700, color: "#1F2937", textAlign: "center" }}
        >
          Academic Performance{currentTerm ? ` – ${currentTerm}` : ""}
        </Typography>
      </div>

      <div className="top-bar">
        <div className="term-section">
          <Typography className="term-label">Select Term</Typography>
          <Button
            disabled={loadingTermCodes || !termCodesResult}
            dropdown={termCodesResult
              ?.filter((item) => !blockedTermCodes.includes(item.termCode))
              .sort((a, b) => a.termCode.localeCompare(b.termCode))
              .map((term) => (
                <DropdownButtonItem
                  key={term.termCode}
                  onClick={() => handleTermChange(term)}
                >
                  {term.term}
                </DropdownButtonItem>
              ))}
          >
            {loadingTermCodes ? "Loading…" : currentTerm || "Select Term"}
          </Button>
        </div>
      </div>
    </div>
  );
};

HomeHeader.propTypes = {
  currentTerm: PropTypes.string,
  termCodesResult: PropTypes.array,
  blockedTermCodes: PropTypes.array.isRequired,
  loadingTermCodes: PropTypes.bool.isRequired,
  handleTermChange: PropTypes.func.isRequired,
};

export default HomeHeader;
