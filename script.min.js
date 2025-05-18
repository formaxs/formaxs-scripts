(function () {
  const scriptTag = document.currentScript;
  const formId = scriptTag.dataset.formId;

  if (!formId) {
    console.error(
      "Form ID is required. Please add the data-form-id attribute to the script tag."
    );
    return;
  }

  const options = {
    formId: formId,
    embedMode: scriptTag.dataset.embedMode || "floating",
    baseUrl: scriptTag.dataset.baseUrl || "https://formaxs.com",
    openTrigger: scriptTag.dataset.openTrigger,
    darkOverlay: scriptTag.dataset.darkOverlay === "true",
    buttonLabel: (scriptTag.dataset?.label || "").trim(),
    maxFormWidth: scriptTag.dataset.maxFormWidth || "500px",
    buttonBackgroundColor: scriptTag.dataset.buttonBgColor || "#007bff",
    buttonTextColor: scriptTag.dataset.buttonTextColor || "#fff",
    labelBgColor: scriptTag.dataset.labelBgColor || "#fff",
    labelTextColor: scriptTag.dataset.labelTextColor || "#000",
    scrollPercentage: parseInt(scriptTag.dataset.scrollPercentage || 0),
    timeDelay: parseInt(scriptTag.dataset.timeDelay || 1),
    margin: scriptTag.dataset.margin || "0 auto",
    defaultIconHTML:
      scriptTag.dataset.iconHtml ||
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    closeIconHTML:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  };

  options.formSrc = `${options.baseUrl}/form/${options.formId}?embed=1`;

  function createFormEmbed(config) {
    const {
      formId,
      embedMode,
      formSrc,
      maxFormWidth,
      darkOverlay,
      buttonLabel,
      labelBgColor,
      labelTextColor,
      buttonBackgroundColor,
      buttonTextColor,
      openTrigger,
      scrollPercentage,
      timeDelay,
      margin,
      defaultIconHTML,
      closeIconHTML,
    } = config;

    const iframe = document.createElement("iframe");
    iframe.src = formSrc;
    iframe.id = `formaxs-frame-${formId}`;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("importance", "high");
    iframe.setAttribute("fetchpriority", "high");

    window.addEventListener(
      "message",
      function (event) {
        if (event.data.type === `formaxs-height-${formId}`) {
          iframe.style.height = event.data.height + "px";
        }
      },
      false
    );

    if (embedMode === "floating") {
      function css(element, styles) {
        Object.assign(element.style, styles);
      }

      const button = document.createElement("div");
      button.id = `formaxs-widget-button-${formId}`;

      const iconContainer = document.createElement("div");
      iconContainer.innerHTML = defaultIconHTML;
      css(iconContainer, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      });

      if (buttonLabel) {
        const label = document.createElement("span");
        label.innerText = buttonLabel;
        css(label, {
          background: labelBgColor,
          color: labelTextColor,
          padding: "3px 12px",
          borderRadius: "8px",
          position: "absolute",
          top: "-70%",
          right: "0",
          fontSize: "13px",
          fontWeight: "400",
          display: "flex",
          width: "max-content",
          boxShadow: "1px 2px 6px rgba(0,0,0,0.1)",
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        });
        button.appendChild(label);
      }

      button.appendChild(iconContainer);

      css(button, {
        width: "60px",
        height: "60px",
        borderRadius: "30px",
        background: buttonBackgroundColor,
        color: buttonTextColor,
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999999999999",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        transition: "transform 0.2s ease",
        overflow: "visible",
      });

      const modalContainer = document.createElement("div");
      modalContainer.id = `formaxs-modal-${formId}`;
      css(modalContainer, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "999999999999999",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        ...(darkOverlay ? { backgroundColor: "rgba(0, 0, 0, 0.4)" } : {}),
      });

      const modalContent = document.createElement("div");
      css(modalContent, {
        background: "transparent",
        maxWidth: maxFormWidth,
        width: "100%",
        maxHeight: "98vh",
        position: "relative",
        ...(darkOverlay ? {} : { boxShadow: "1px 4px 15px rgba(0,0,0,0.2)" }),
        overflowY: "auto",
        borderRadius: "8px",
      });

      css(iframe, {
        width: "100%",
        border: "none",
        borderRadius: "8px",
        display: "block",
        background: "transparent",
      });

      modalContent.appendChild(iframe);
      modalContainer.appendChild(modalContent);

      let isModalOpen = false;

      function openModal() {
        modalContainer.style.display = "flex";
        modalContent.style.transform = "scale(0.9)";
        modalContent.style.opacity = "0";
        setTimeout(() => {
          modalContent.style.transition =
            "transform 0.3s ease, opacity 0.3s ease";
          modalContent.style.transform = "scale(1)";
          modalContent.style.opacity = "1";
        }, 10);
        isModalOpen = true;
        iconContainer.innerHTML = closeIconHTML;
      }

      function closeModal() {
        modalContent.style.transform = "scale(0.9)";
        modalContent.style.opacity = "0";
        setTimeout(() => {
          modalContainer.style.display = "none";
          modalContent.style.transition = "";
        }, 300);
        isModalOpen = false;
        iconContainer.innerHTML = defaultIconHTML;
      }

      function toggleModal() {
        if (isModalOpen) {
          closeModal();
        } else {
          openModal();
        }
      }

      document.body.appendChild(modalContainer);

      if (openTrigger === "button") {
        document.body.appendChild(button);
        button.addEventListener("click", toggleModal);
      } else if (openTrigger === "load") {
        if (document.readyState === "complete") {
          openModal();
        } else {
          window.addEventListener("load", openModal);
        }
      } else if (openTrigger === "scroll") {
        let scrollTriggered = false;
        window.addEventListener("scroll", function () {
          if (isModalOpen || scrollTriggered) return;

          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const docHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

          if (docHeight === 0) {
            if (scrollPercentage === 0 && !scrollTriggered) {
              openModal();
              scrollTriggered = true;
            }
            return;
          }

          const currentScrollPercentage = (scrollTop / docHeight) * 100;

          if (currentScrollPercentage >= scrollPercentage) {
            openModal();
            scrollTriggered = true;
          }
        });
      } else if (openTrigger === "time") {
        if (timeDelay > 0) {
          setTimeout(() => {
            if (!isModalOpen) openModal();
          }, timeDelay * 1000);
        } else {
          if (!isModalOpen) openModal();
        }
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalContainer.style.display === "flex") {
          closeModal();
        }
      });
    } else if (embedMode === "standard") {
      const container = document.createElement("div");
      container.id = `formaxs-container-${formId}`;
      Object.assign(container.style, {
        width: "100%",
        maxWidth: maxFormWidth,
        margin: margin,
        padding: "0",
        display: "block",
      });

      Object.assign(iframe.style, {
        width: "100%",
        border: "none",
        outline: "none",
        overflow: "hidden",
        display: "block",
        margin: "0",
        padding: "0",
        background: "transparent",
      });

      container.appendChild(iframe);
      const scriptById = document.getElementById(`formaxs-script-${formId}`);
      let insertLocation = scriptById || scriptTag;
      console.log({ scriptById, scriptTag });
      insertLocation.parentNode.insertBefore(container, insertLocation);
    } else {
      console.error(`Formaxs: Invalid embedMode "${embedMode}" specified.`);
    }
  }
  createFormEmbed(options);
})();
