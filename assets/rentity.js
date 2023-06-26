const RentityBridge =
  window.RentityBridge ||
  (function () {
    const tokenName = "rentity-visitor-id";
    const urlHost = "/apps/rentity";
    const _headers = {
      "Content-Type": "application/json",
      "rentity-auth-token": localStorage.getItem(tokenName),
    };
    const getCart = async function () {
      const response = await fetch(`${urlHost}/cart`, {
        headers: _headers,
      });

      return response.json();
    };

    const addItemToCart = async function ({
      productId,
      variantId,
      quantity,
      tenure,
      image,
      productVariantUrl,
    }) {
      const response = await fetch(`${urlHost}/cart`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: _headers,
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
          tenure,
          image,
          productVariantUrl,
        }),
      });
      return response.json();
    };

    const updateCartLineItem = async function ({ rLineId, quantity, tenure }) {
      const response = await fetch(`${urlHost}/cart/updateItem`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: _headers,
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ rLineId, quantity, tenure }),
      });
      return response.json();
    };

    const removeCartItem = async function (orderLineId) {
      const response = await fetch(
        `${urlHost}/cart/removeItem/${orderLineId}`,
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: _headers,
          redirect: "follow",
          referrerPolicy: "no-referrer",
          body: JSON.stringify({}),
        }
      );
      return response.json();
    };

    const getRentalPlan = async function ({ sProductId, sVariantId }) {
      const response = await fetch(
        `${urlHost}/rental-plan/product/${sProductId}/variant/${sVariantId}`
      );
      return response.json();
    };

    const getRentCartItemCount = async function () {
      const response = await fetch(`${urlHost}/cart/quantity`, {
        headers: _headers,
      });

      return response.json();
    };

    return {
      getRentCart: getCart,
      addItemToRentCart: addItemToCart,
      updateCartLineItem: updateCartLineItem,
      removeCartLineItem: removeCartItem,
      getRentalPlan: getRentalPlan,
      getRentCartItemCount: getRentCartItemCount,
    };
  })();

$(document).ready(function () {
  var popupHandler = (function () {
    var _this = this;

    _this._selectors = {
      cartPopup: "[data-cart-popup]",
      cartPopupWrapper: "[data-cart-popup-wrapper]",
      cartPopupTitle: "[data-cart-popup-title]",
      cartPopupQuantity: "[data-cart-popup-quantity]",
      cartPopupQuantityLabel: "[data-cart-popup-quantity-label]",
      cartPopupClose: "[data-cart-popup-close]",
      cartPopupDismiss: "[data-cart-popup-dismiss]",
      cartPopupImageWrapper: "[data-cart-popup-image-wrapper]",
      cartPopupImagePlaceholder: "[data-cart-popup-image-placeholder]",
      cartPopupImage: "[data-cart-popup-image]",
      cartPopupDescription: ".cart-popup-desciption",
      cartPopupViewCartBtn: ".cart-popup__cta-link",
    };

    _this._classes = {
      cartPopupWrapperHidden: "cart-popup-wrapper--hidden",
      hidden: "hide",
    };

    function _setupCartPopup(item) {
      _this.$cartPopup = _this.$cartPopup || $(_this._selectors.cartPopup);
      _this.$cartPopupWrapper =
        _this.$cartPopupWrapper || $(_this._selectors.cartPopupWrapper);
      _this.$cartPopupTitle =
        _this.$cartPopupTitle || $(_this._selectors.cartPopupTitle);
      _this.$cartPopupQuantity =
        _this.$cartPopupQuantity || $(_this._selectors.cartPopupQuantity);
      _this.$cartPopupQuantityLabel =
        _this.$cartPopupQuantityLabel ||
        $(_this._selectors.cartPopupQuantityLabel);
      _this.$cartPopupClose =
        _this.$cartPopupClose || $(_this._selectors.cartPopupClose);
      _this.$cartPopupDismiss =
        _this.$cartPopupDismiss || $(_this._selectors.cartPopupDismiss);
      _this.$cartPopupDescription =
        _this.$cartPopupDescription || $(_this._selectors.cartPopupDescription);
      _this.$cartPopupViewCartBtn =
        _this.$cartPopupViewCartBtn || $(_this._selectors.cartPopupViewCartBtn);
      _this.originalCartPopupDescription = _this.$cartPopupDescription.html();
      _this.originalCartViewCartBtnText = _this.$cartPopupViewCartBtn.html();
      _this.originalCartViewCartBtnLink =
        _this.$cartPopupViewCartBtn.attr("href");
      _setupCartPopupEventListeners();
      _updateCartPopupContent(item);
    }

    function _updateCartPopupContent(item) {
      _this.$cartPopupTitle.text(item.product_title);
      _setCartPopupImage(item.image, item.title);
      _this.$cartPopupDescription.html(
        "is added to your rent cart. You can change the tenure in rent cart page."
      );
      _this.$cartPopupViewCartBtn.html("Rent cart");
      _this.$cartPopupViewCartBtn.attr("href", "/cart/?view=rentity");
      _showCartPopup();
    }

    function _setCartPopupImage(imageUrl, productTitle) {
      _this.$cartPopupImageWrapper =
        _this.$cartPopupImageWrapper ||
        $(_this._selectors.cartPopupImageWrapper);

      _this.$cartPopupImagePlaceholder =
        _this.$cartPopupImagePlaceholder ||
        $(_this._selectors.cartPopupImagePlaceholder);

      if (imageUrl === null) {
        _this.$cartPopupImageWrapper.addClass(_this._classes.hidden);
        return;
      }

      _this.$cartPopupImageWrapper.removeClass(_this._classes.hidden);
      var sizedImageUrl = imageUrl; //theme.Images.getSizedImageUrl(imageUrl, '200x');
      var image = document.createElement("img");
      image.src = sizedImageUrl;
      image.alt = productTitle;
      image.dataset.cartPopupImage = "";

      image.onload = function () {
        _this.$cartPopupImagePlaceholder.addClass(_this._classes.hidden);
        _this.$cartPopupImageWrapper.append(image);
      }.bind(_this);
    }

    function _setupCartPopupEventListeners() {
      _this.$cartPopupWrapper.on(
        "keyup",
        function (event) {
          if (event.keyCode === slate.utils.keyboardKeys.ESCAPE) {
            _hideCartPopup(event);
          }
        }.bind(_this)
      );

      _this.$cartPopupClose.on("click", _hideCartPopup.bind(_this));
      _this.$cartPopupDismiss.on("click", _hideCartPopup.bind(_this));
      $("body").on("click", _onBodyClick.bind(_this));
    }

    function _showCartPopup() {
      _this.$cartPopupWrapper
        .prepareTransition()
        .removeClass(_this._classes.cartPopupWrapperHidden);

      slate.a11y.trapFocus({
        $container: _this.$cartPopupWrapper,
        $elementToFocus: _this.$cartPopup,
        namespace: "cartPopupFocus",
      });
    }

    function _hideCartPopup(event) {
      var setFocus = event.detail === 0 ? true : false;
      _this.$cartPopupWrapper
        .prepareTransition()
        .addClass(_this._classes.cartPopupWrapperHidden);

      $(_this._selectors.cartPopupImage).remove();
      _this.$cartPopupImagePlaceholder.removeClass(_this._classes.hidden);

      slate.a11y.removeTrapFocus({
        $container: _this.$cartPopupWrapper,
        namespace: "cartPopupFocus",
      });

      if (setFocus) _this.$previouslyFocusedElement[0].focus();

      _this.$cartPopupDescription.html(_this.originalCartPopupDescription);
      _this.$cartPopupViewCartBtn.html(_this.originalCartViewCartBtnText);
      _this.$cartPopupViewCartBtn.attr(
        "href",
        _this.originalCartViewCartBtnLink
      );

      _this.$cartPopupWrapper.off("keyup");
      _this.$cartPopupClose.off("click");
      _this.$cartPopupDismiss.off("click");
      $("body").off("click");
    }

    function _onBodyClick(event) {
      var $target = $(event.target);

      if (
        $target[0] !== _this.$cartPopupWrapper[0] &&
        !$target.parents(_this._selectors.cartPopup).length
      ) {
        _hideCartPopup(event);
      }
    }

    return {
      showRentCartPopup: _setupCartPopup,
    };
  })();
  var selectors = {
    addToRentCartActionBtn: ".rentity-add-to-rent-cart-btn",
    capsule: ".rentity-capsule",
    detailCard: ".rentity-rental-detail-card",
    quantity: ".rQuantity",
    tenure: ".rTenure",
    ticksContainer: ".ticks",
    quantityPlus: ".plus",
    quantityMinus: ".minus",
    rentValue: ".rentValue",
    depositValue: ".rdeposit",
    subtotalValue: ".subtotal",
    addToRentCartBtn: ".addToRentCartBtn",
    rentNowBtn: ".rentNowBtn",
    logoutLink: "#customer_logout_link",
    cartDropdown: "#cart-rent",
    cartDropdownProductListContainer: ".rent-products-list",
    cartDropdownSummary: ".rent-summary",
    cartDropdownViewRentCarBtn: ".btn--viewRentCar",
    cartDropdownCheckoutRentCarBtn: ".btn--checkoutRentCart",
    cartDropdownActionbar: ".actions",
    cartDropdownSummaryPrice: ".rent-summary > .price",
    cartDropdownHasNoRentItemsInCart: ".no-rent-items",
    cartDropdownHasRentItemsInCart: ".has-rent-items",
    cartDropdownCheckoutFormEl: "#rentityCheckoutDrpdownForm",
    cartDropdownCheckoutIdEl: "#rentityCartDropdownCheckoutId",
    cartPageCheckoutFormEl: "#rentityCheckoutPageForm",
    cartPageCheckoutIdEl: "#rentityCartPageCheckoutId",
    rentCartPage: ".rent-cart-page",
    totalRentalPrice: ".rental-total-price",
    totalRentalDues: ".rental-dues",
    totalRefundableDeposits: ".rental-deposit",
  };

  var tokenName = "rentity-visitor-id";

  const $cartDropdownEl = $(selectors.cartDropdown);
  const $cartDropdownHasNoRentItemsInCart = $cartDropdownEl.find(
    selectors.cartDropdownHasNoRentItemsInCart
  );
  const $cartDropdownHasRentItemsInCart = $cartDropdownEl.find(
    selectors.cartDropdownHasRentItemsInCart
  );
  $cartDropdownHasNoRentItemsInCart.show();
  $cartDropdownHasRentItemsInCart.hide();

  const $cartPageEl = $(selectors.rentCartPage);
  const $summaryColumn = $cartPageEl.find(".right-col");
  $summaryColumn.hide();

  var defaultMoney = "INR";
  var moneySymbols = {
    INR: "₹",
  };

  /**event*/
  const cartPageRemoveItemBtn = ".rental-item-remove";
  const cartPageUpdateItemBtn = ".rental-item-update";
  $(document).on("click", cartPageRemoveItemBtn, removeItemFromRentCart);
  $(document).on("click", cartPageUpdateItemBtn, updateItemFromRentCart);

  /**end of event*/

  function renderRentCartDropdown(cartObj, checkoutUrl) {
    function generateRentCarpDropdownHTML(cartObj) {
      var productLines = [];
      _.each(cartObj.lines, function (line) {
        var metaData = JSON.parse(line.customFields.metaData);
        var rentalPrice = line.rentalPrice;
        var _html = `<div class="items" id="cart-item-${
          line.id
        }" data-rLineId="${line.id}">
                <div class="product-on-cart">
                    <a href="${
                      metaData.productVariantUrl
                    }" class="product-image">
                        <img src="${metaData.image}" alt="${
          line.productVariant.name
        }">
                    </a>

<div class="product-details" style="padding-right:20px;">
                        <a href="javascript:void(0)" title="Remove" class="btn-rent-remove" aria-label="close">
                            <span>&#215;</span>
                            <span class="loader" style="display:none">
	                            <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-spinner" viewBox="0 0 20 20"><path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" fill="#919EAB"></path></svg>
                            </span>                                      
                        </a>

                        <a class="product-name" href="${
                          metaData.productVariantUrl
                        }" aria-label="title">
                            ${line.productVariant.name}
                        </a>
                        <div class="cart-collateral" style="margin-bottom:10px">
                            <div><span style="color:#4f4f4f">Monthly Rent:</span> <span style="font-size:10px; color:#b20000;font-weight:bold;">billed for ${
                              rentalPrice.tenure
                            } months</span></div>
                            <div>
                              <span class="qtt">
                                  ${line.quantity} X
                              </span>
                              <span class="price money">
                                  ${moneySymbols.INR} ${
                                    (
                                      rentalPrice.rentPerMonthWithTax / 100
                                    ).toFixed(
                                      2
                                    )
        }
                              </span>
                            </div>
                        </div>
                        <div class="cart-collateral" style="margin-bottom:10px">
                            <div style="color:#4f4f4f">Refundable Deposit:</div>
                            <div>
                              <span class="qtt">
                                  ${line.quantity} X
                              </span>
                              <span class="price money">
                                  ${moneySymbols.INR} ${
          rentalPrice.securityDeposit / 100
        }
                              </span>
                            </div>
                        </div>
                        <div class="cart-collateral">
                            <span class="qtt">Tenure:</span>
                            <span class="price money">
                                ${rentalPrice.tenure} months
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
        productLines.push(_html);
      });
      return productLines.join();
    }

    const $cartDropdownEl = $(selectors.cartDropdown);
    const $productListEl = $cartDropdownEl.find(
      selectors.cartDropdownProductListContainer
    );
    const $summaryPriceEl = $cartDropdownEl.find(
      selectors.cartDropdownSummaryPrice
    );
    const $cartDropdownHasNoRentItemsInCart = $cartDropdownEl.find(
      selectors.cartDropdownHasNoRentItemsInCart
    );
    const $cartDropdownHasRentItemsInCart = $cartDropdownEl.find(
      selectors.cartDropdownHasRentItemsInCart
    );
    const $cartDropdownCheckoutFormEl = $cartDropdownEl.find(
      selectors.cartDropdownCheckoutFormEl
    );
    const $cartDropdownCheckoutIdEl = $cartDropdownEl.find(
      selectors.cartDropdownCheckoutIdEl
    );

    $cartDropdownCheckoutFormEl.attr("action", checkoutUrl);
    $cartDropdownCheckoutIdEl.attr("value", localStorage.getItem(tokenName));

    if (cartObj.lines?.length) {
      $cartDropdownHasNoRentItemsInCart.hide();
      $cartDropdownHasRentItemsInCart.show();
    } else {
      $cartDropdownHasNoRentItemsInCart.show();
      $cartDropdownHasRentItemsInCart.hide();
    }

    $productListEl.html(generateRentCarpDropdownHTML(cartObj));
    $summaryPriceEl.html(moneySymbols.INR + " " + cartObj.totalWithTax / 100);

    const btnRemove = $productListEl.find(".btn-rent-remove");
    btnRemove.on("click", removeItemFromRentCart);
  }

  function renderCartPage(cartObj, checkoutUrl) {
    const minusIcon = `<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--wide icon-chevron-down" viewBox="0 0 498.98 284.49"><defs></defs><path class="cls-1" d="M80.93 271.76A35 35 0 0 1 140.68 247l189.74 189.75L520.16 247a35 35 0 1 1 49.5 49.5L355.17 511a35 35 0 0 1-49.5 0L91.18 296.5a34.89 34.89 0 0 1-10.25-24.74z" transform="translate(-80.93 -236.76)"></path></svg>`;
    const plusIcon = `<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--wide icon-chevron-up" viewBox="0 0 498.98 284.49"><defs><style>.cls-1{fill:#231f20}</style></defs><path class="cls-1" d="M579.91 486.24A35 35 0 0 1 520.16 511L330.42 321.25 140.68 511a35 35 0 1 1-49.5-49.5L305.67 247a35 35 0 0 1 49.5 0l214.49 214.5a34.89 34.89 0 0 1 10.25 24.74z" transform="translate(-80.93 -236.76)"></path></svg>`;
    function generateRentalPlansDropdownHtml(sectionId, plans, selectedTenure) {
      if (!plans.length) {
        return "";
      }
      var _htmlElStartTag = `<select name="tenure_updates_${sectionId}" id="tenure_updates_${sectionId}">`;
      var _htmlElEndTag = `</select>`;
      var _optionsTag = [];
      _optionsTag.push(_htmlElStartTag);
      _.each(plans, function (plan) {
        const selectedOption = plan.tenure == selectedTenure ? "selected" : "";
        _optionsTag.push(
          `<option value="${plan.tenure}" ${selectedOption}> ${
            plan.tenure
          } months (${moneySymbols.INR} ${(plan.price / 100).toFixed(
            2
          )} / mo)</option>`
        );
      });
      _optionsTag.push(_htmlElEndTag);
      const _html = _optionsTag.join();
      return _html;
    }
    function generateCartItemsHTML(cartObj) {
      var productLines = [];
      _.each(cartObj.lines, function (line, i) {
        const metaData = JSON.parse(line.customFields.metaData);
        const rentalPrice = line.rentalPrice;
        const rentalPlans = JSON.parse(
          line.productVariant.rentalPlans || '{"plans":[]}'
        );
        const _tenureDrodownHTML = generateRentalPlansDropdownHtml(
          line.id,
          rentalPlans.plans,
          rentalPrice.tenure
        );

        const _html = `<li class="items" data-product_id="${
          metaData.sProductId
        }" data-rLineId="${line.id}">
                      <div class="details">   
                          <div class="cart-thumb">
                              <a class="product-img" href="${
                                metaData.productVariantUrl
                              }" aria-label="link">
                                  <img src="${metaData.image}"  alt="${
          line.productVariant.name
        }">
                              </a> 
                          </div>
                          <div class="cart-details">
                              <h4 class="product-title">
                                  <a href="${
                                    metaData.productVariantUrl
                                  }" class="product-name" aria-label="link">
                                      ${line.productVariant.name}
                                  </a>
                              </h4>
        						<div class="product-price" style="display:flex">
        <div style="margin-right:65px;">
								        Monthly Rent:<br/> 
        <span class="price-item price-item--regular" style="color:#b20000">
                                          <span>${moneySymbols.INR} ${(
          rentalPrice.rentPerMonthWithTax / 100
        ).toFixed(
          2
        )}</span> <span style="font-size: 10px;margin-left: 4px;">(Billed for ${
          rentalPrice.tenure
        } month)</span>
                                      	</span>
        							</div>
        							<div>
								        Refundable deposit:<br/>
                                      <span class="price-item price-item--regular">
                                           ${moneySymbols.INR} ${(
          rentalPrice.securityDeposit / 100
        ).toFixed(2)}
                                      </span>
        							</div>
                              </div>
        <div style="display:flex">
        						 <div style="margin-right: 15px;">
                                    <div style="margin-bottom:5px">Tenure (months):</div>
                                    <div>

										${_tenureDrodownHTML}
									</div>
                                  </div>
                                  <div class="quantity cart__update-control">
                                      <label for="Quantity-${
                                        metaData.sProductId
                                      }" style="font-weight: normal;">Quantity:</label>
                                      <div class="qty-group">
                                          <a href="#" data-qtt data-minus-qtt class="minus button"> ${minusIcon} </a>
                                          <input class="cart__qty-input" type="text" name="updates[]" id="updates_${
                                            line.id
                                          }" value="${
          line.quantity
        }" data-quantity-item="${i}">
                                          <a href="#" data-qtt data-plus-qtt class="plus button"> ${plusIcon}</a>
                                      </div>
                                  </div>                                        
					        </div>
                              <div class="button-groups cart__update-wrapper">
                                  <div class="group-action">
                                      <button type="button" name="update" class=" btn btn--secondary cart__update-control rental-item-update" aria-label="Update ${
                                        line.productVariant.name
                                      }">
                                          <span>Update</span>
                                          <span class="loader" style="display:none">
                                              <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-spinner" viewBox="0 0 20 20"><path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" fill="#919EAB"></path></svg>
                                          </span>                                      
                                      </button>

                                      <button type="button" class="remove btn btn--secondary rental-item-remove" data-id="${
                                        line.id
                                      }" aria-label="link">
                                          <span class="icon--big">&#215;</span>
                                          <span>Remove</span>
                                          <span class="loader" style="display:none">
                                              <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-spinner" viewBox="0 0 20 20"><path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" fill="#919EAB"></path></svg>
                                          </span>                                          
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </li>
        `;
        productLines.push(_html);
      });
      return productLines.join();
    }

    const $cartPageEl = $(selectors.rentCartPage);
    const $productListEl = $cartPageEl.find(".cart-list");
    const $totalRentalPrice = $cartPageEl.find(selectors.totalRentalPrice);
    const $totalRentalDues = $cartPageEl.find(selectors.totalRentalDues);
    const $totalRefundableDeposits = $cartPageEl.find(
      selectors.totalRefundableDeposits
    );
    const $summaryColumn = $cartPageEl.find(".right-col");

    if ($cartPageEl.length > 0 && $productListEl.length > 0) {
      if (cartObj?.totalQuantity) {
        const $cartPageCheckoutFormEl = $cartPageEl.find(
          selectors.cartPageCheckoutFormEl
        );
        const $cartPageCheckoutIdEl = $cartPageEl.find(
          selectors.cartPageCheckoutIdEl
        );

        //calculate totaldues & rents
        var tDeposits = 0;
        var tRents = 0;
        _.each(cartObj.lines, function (line) {
          tRents +=
            line.rentalPrice.rentPerMonthWithTax *
            line.quantity *
            line.rentalPrice.tenure;
          tDeposits += line.rentalPrice.securityDeposit * line.quantity;
        });

        $cartPageCheckoutFormEl.attr("action", checkoutUrl);
        $cartPageCheckoutIdEl.attr("value", localStorage.getItem(tokenName));

        $productListEl.html(generateCartItemsHTML(cartObj));
        $totalRentalPrice.html(
          (cartObj.totalWithTax / 100).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
          })
        );

        $totalRefundableDeposits.html(
          (tDeposits / 100).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
          })
        );
        $totalRentalDues.html(
          (tRents / 100).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
          })
        );

        $summaryColumn.show();
      } else {
        $productListEl.html(`<li>Your rent cart is currently empty.</li>`);
        $summaryColumn.hide();
      }
    }
  }

  async function removeItemFromRentCart(event) {
    event.preventDefault();
    const lineId = $(this).parents(".items").attr("data-rLineId");
    if (lineId) {
      const loader = $(this).find(".loader");
      loader.css("display", "inline-block");
      var response = await RentityBridge.removeCartLineItem(lineId);
      loader.css("display", "none");
      console.log(response);
      await renderRentCart(response);
    }
  }

  async function updateItemFromRentCart(event) {
    event.preventDefault();
    const $lineItemEl = $(this).parents(".items");
    const lineId = $lineItemEl.attr("data-rLineId");
    const tenure = $lineItemEl.find(`#tenure_updates_${lineId}`).val() * 1;
    const quantity = $lineItemEl.find(`#updates_${lineId}`).val() * 1;
    console.log({ lineId, tenure, quantity });
    const loader = $(this).find(".loader");
    loader.css("display", "inline-block");
    var response = await RentityBridge.updateCartLineItem({
      rLineId: lineId,
      quantity,
      tenure,
    });
    loader.css("display", "none");
    console.log(response);
    await renderRentCart(response);
  }

  async function renderRentCart(responseObj) {
    var activeCartResponse = responseObj || (await RentityBridge.getRentCart());
    console.log("activeRentCart", activeCartResponse);
    const data = activeCartResponse?.data || {};
    const cartObj = activeCartResponse?.status
      ? data?.activeOrder || data?.removeOrderLine || data?.addItemToOrder || {}
      : {};
    const checkoutUrl = data.checkoutUrl;
    renderRentCartDropdown(cartObj, checkoutUrl);
    renderCartPage(cartObj, checkoutUrl);
    setCartBubbleCount(cartObj);
  }

  async function setCartBubbleCount(cartObj) {
    const totalCartCount = cartObj?.totalQuantity || 0;
    $("[data-rent-cart-count]").text(totalCartCount);
  }

  /*Logout hook*/
  (function (ls, i, t, s) {
    i(s.logoutLink).click(function () {
      ls.removeItem(t);
    });
  })(localStorage, $, tokenName, selectors);

  /*create session token*/
  (async function (ls, i) {
    var token = ls.getItem(tokenName);
    if (!token) {
      var res = await i.post("/apps/rentity/session");
      if (res?.token) {
        ls.setItem(tokenName, res.token);
      }
    }
    await renderRentCart();
  })(localStorage, $);

  async function getActiveRentCart() {
    const url = "/apps/rentity/cart";
    const rawResponse = await fetch(url, {
      headers: {
        "rentity-auth-token": localStorage.getItem(tokenName),
      },
    });
    const data = await rawResponse.json();
    return data;
  }

  /*Hook for rentity capsule*/
  (function () {
    var capsules = $(selectors.capsule);
    $.each(capsules, function () {
      var el = $(this);
      this.pId = el.data("product-id");
      this.vId = el.data("product-variant-id");
      var rental_plan_url = `/apps/rentity/rental-plan/product/${this.pId}/variant/${this.vId}`;
      var _this = this;
      $.getJSON(rental_plan_url).then(function (resp) {
        var rentalPlans = resp.data.plans;
        rentalPlans.sort((a, b) => a.tenure - b.tenure);

        var leastPlanRent = (_.last(rentalPlans).price / 100).toFixed(2);
        $(`#rentity-variant-${_this.vId}-capsule`)
          .find(".rental-option")
          .html(
            `Rent from ${moneySymbols[defaultMoney]}<span id="rentity-rent-rate">${leastPlanRent} /mo</span><sup>*</sup>`
          );
      });
    });
  })();

  /*Hook for rentity addToRentCartActionBtn*/
  (function () {
    var actionBtns = $(selectors.addToRentCartActionBtn);
    $.each(actionBtns, function () {
      const el = $(this);
      const _this = this;
      const $addToRentCartBtn = (_this.$addToRentCartBtn = el.find(
        "button[name='addToRentCart']"
      ));
      _this.$loader = $addToRentCartBtn.find(".loader");
      _this.$el = el;
      _this.pId = $addToRentCartBtn.data("product-id");
      _this.vId = $addToRentCartBtn.data("product-variant-id");
      _this.vImage = $addToRentCartBtn.data("product-variant-image");
      _this.vUrl = $addToRentCartBtn.data("product-variant-url");
      _this.pTitle = $addToRentCartBtn.data("product-title");

      var rental_plan_url = `/apps/rentity/rental-plan/product/${this.pId}/variant/${this.vId}`;
      $.getJSON(rental_plan_url).then(function (resp) {
        var rentalPlans = resp.data.plans;
        rentalPlans.sort((a, b) => a.tenure - b.tenure);
        const leastPlan = _.last(rentalPlans);
        const leastPlanRent = (leastPlan.price / 100).toFixed(2);
        const leastPlanTenure = leastPlan.tenure;
        _this.$addToRentCartBtn.data("rental-quantity", 1);
        _this.$addToRentCartBtn.data("rental-tenure", leastPlanTenure);
        _this.$addToRentCartBtn.click(async (event) => {
          _this.$loader.show();
          const el = _this.$addToRentCartBtn;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          var _tenure = el.data("rental-tenure");
          var _payload = {
            productId: _this.pId,
            variantId: _this.vId,
            quantity: el.data("rental-quantity") * 1,
            tenure: _tenure * 1,
            image: _this.vImage,
            productVariantUrl: _this.vUrl,
          };

          const response = await RentityBridge.addItemToRentCart(_payload);
          console.log(response);
          renderRentCart(response);
          _this.$loader.hide();
          popupHandler.showRentCartPopup({
            product_title: _this.pTitle,
            title: _this.pTitle,
            image: _this.vImage,
          });
          return;
        });

        _this.$el
          .find(".rental-option")
          .html(
            `${moneySymbols[defaultMoney]}<span id="rentity-rent-rate">${leastPlanRent} /mo</span><sup>*</sup>`
          );
        _this.$addToRentCartBtn.show();
      });
    });
  })();

  /*Hook for Rent details card*/
  (async function () {
    var _this = this;
    this.$rentalDetailCard = $(selectors.detailCard);
    var rentalDetailCard = this.$rentalDetailCard;

    if (!rentalDetailCard.length) {
      return;
    }
    this.rentalPlans = [];
    this.$quantityTextEl = rentalDetailCard.find(selectors.quantity);
    this.$tenureEl = rentalDetailCard.find(selectors.tenure);
    this.$ticksContainerEl = rentalDetailCard.find(selectors.ticksContainer);
    this.$plusBtn = rentalDetailCard.find(selectors.quantityPlus);
    this.$minusBtn = rentalDetailCard.find(selectors.quantityMinus);
    this.$rentValueEl = rentalDetailCard.find(selectors.rentValue);
    this.$depositValueEl = rentalDetailCard.find(selectors.depositValue);
    this.$subtotalValueEl = rentalDetailCard.find(selectors.subtotalValue);
    this.$addToRentCartBtn = rentalDetailCard.find(selectors.addToRentCartBtn);
    this.$rentNowBtn = rentalDetailCard.find(selectors.rentNowBtn);

    this.pId = rentalDetailCard.data("product-id");
    this.vId = rentalDetailCard.data("product-variant-id");
    this.vImage = rentalDetailCard.data("product-variant-image");
    this.vUrl = rentalDetailCard.data("product-variant-url");
    this.pTitle = rentalDetailCard.data("product-title");
    var rental_plan_url = `/apps/rentity/rental-plan/product/${this.pId}/variant/${this.vId}`;

    this.setTenure = function (plan) {
      if (!plan?.tenure) {
        return;
      }

      var { price, deposit } = plan;
      var formatedPrice = (price / 100).toFixed(2);
      var priceDisplayText = moneySymbols[defaultMoney] + formatedPrice;
      var formatedDeposit = (deposit / 100).toFixed(2);
      var depostDisplayText = moneySymbols[defaultMoney] + formatedDeposit;
      var quantity = _this.$quantityTextEl.val() * 1;

      var subtotalDisplayText =
        moneySymbols[defaultMoney] +
        (quantity * ((price + deposit) / 100)).toFixed(2);

      _this.$rentValueEl.data("selected-plan", JSON.stringify(plan));
      _this.$rentValueEl.html(priceDisplayText);
      _this.$depositValueEl.html(depostDisplayText);
      _this.$subtotalValueEl.html(subtotalDisplayText);
    };

    this.$rentNowBtn.click(async function (event) {
      $(this).find(".loader").show();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var _tenure = JSON.parse(_this.$rentValueEl.data("selected-plan")).tenure;
      var _payload = {
        productId: _this.pId,
        variantId: _this.vId,
        quantity: _this.$quantityTextEl.val() * 1,
        tenure: _tenure,
        image: _this.vImage,
        productVariantUrl: _this.vUrl,
      };

      const response = await RentityBridge.addItemToRentCart(_payload);

      console.log(response);
      renderRentCart(response);
      $(this).find(".loader").hide();
      window.location.href = "/cart/?view=rentity";
    });

    this.$addToRentCartBtn.click(async function (event) {
      $(this).find(".loader").show();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var _tenure = JSON.parse(_this.$rentValueEl.data("selected-plan")).tenure;
      var _payload = {
        productId: _this.pId,
        variantId: _this.vId,
        quantity: _this.$quantityTextEl.val() * 1,
        tenure: _tenure,
        image: _this.vImage,
        productVariantUrl: _this.vUrl,
      };

      const response = await RentityBridge.addItemToRentCart(_payload);

      console.log(response);
      renderRentCart(response);
      $(this).find(".loader").hide();
      popupHandler.showRentCartPopup({
        product_title: _this.pTitle,
        title: _this.pTitle,
        image: _this.vImage,
      });

      return;
    });

    this.$minusBtn.click(function () {
      var $el = $(this);
      var oldVal = _this.$quantityTextEl.val() * 1;
      _this.$quantityTextEl.val(oldVal == 1 ? 1 : oldVal - 1);
      _this.setTenure(_this.rentalPlans[_this.$tenureEl.val() * 1 - 1]);
    });

    this.$plusBtn.click(function () {
      var $el = $(this);
      var oldVal = _this.$quantityTextEl.val() * 1;
      _this.$quantityTextEl.val(oldVal + 1);
      _this.setTenure(_this.rentalPlans[_this.$tenureEl.val() * 1 - 1]);
    });

    this.$tenureEl.change(function () {
      _this.setTenure(_this.rentalPlans[_this.$tenureEl.val() * 1 - 1]);
    });

    this.$tenureEl.on("input", function () {
      _this.setTenure(_this.rentalPlans[_this.$tenureEl.val() * 1 - 1]);
    });

    const rentalPlansResponse = await RentityBridge.getRentalPlan({
      sProductId: _this.pId,
      sVariantId: _this.vId,
    });

    if (!rentalPlansResponse.status) {
      return;
    }

    _this.rentalPlans = rentalPlansResponse.data.plans || [];
    _this.rentalPlans.sort((a, b) => a.tenure - b.tenure);
    var rentalPlans = _this.rentalPlans;
    _this.$tenureEl.attr("max", rentalPlans.length);
    var rTenureTicksHtml = "";
    _.each(rentalPlans, function (plan) {
      rTenureTicksHtml += '<span class="tick">' + plan.tenure + "</span>";
    });

    _this.$ticksContainerEl.html(rTenureTicksHtml);

    _this.$tenureEl.val(_this.rentalPlans.length);
    _this.setTenure(_.last(_this.rentalPlans));
    _this.$rentalDetailCard.addClass("loaded");
  })();

  /*Hook for rent cart drop down interaction*/
  (function () {
    $("[data-rent-cart-preview-pc]").on("click", function (event) {
      event.preventDefault();
      const $target = $(event.currentTarget);
      if ($target.hasClass("is-open")) {
        $target.removeClass("is-open");
        $("#rent-cart-dropdown").slideUp();
      } else {
        $target.addClass("is-open");
        $("#rent-cart-dropdown").slideDown();
      }
    });

    if ($("#rent-cart-dropdown").length) {
      if ($(window).width() > 1024) {
        if ($("#rent-cart-mobile #rent-cart-dropdown").length) {
          $("#rent-cart-mobile #rent-cart-dropdown").appendTo(".item--cart");
        }
      } else {
        if ($(".item--cart #rent-cart-dropdown").length) {
          $(".item--cart #rent-cart-dropdown").appendTo(
            "#rent-cart-mobile .halo_mobileNavigation_wrapper"
          );
        }
      }
    }

    //         $('[data-cart-preview]').on('click', function(event) {
    //             event.preventDefault();
    //         });

    $(document).on("click", function (event) {
      if ($("[data-rent-cart-preview-pc]").hasClass("is-open")) {
        if (
          $(event.target).closest("[data-rent-cart-preview-pc]").length === 0 &&
          $(event.target).closest("#cart-dropdown").length === 0
        ) {
          $("[data-rent-cart-preview-pc]").removeClass("is-open");
          $("#rent-cart-dropdown").slideUp();
        }
      }
    });

    /** for mobile view*/
    (function toggle_cart() {
      $("[data-rent-cart-preview]").on("click", function (event) {
        $("body").addClass("open_Rent_Cart");
      });

      $("[data-close-rent-cart-preview]").on("click", function (event) {
        $("body").removeClass("open_Rent_Cart");
      });

      $(document).on("click", function (event) {
        if ($("body").hasClass("open_Rent_Cart")) {
          if (
            $(event.target).closest("[data-rent-cart-preview]").length === 0 &&
            $(event.target).closest("#rent-cart-mobile").length === 0
          ) {
            $("body").removeClass("open_Rent_Cart");
          }
        }
      });
    })();
  })();

  (function () {
    function checkForScreenMode() {
      if ($(window).width() > 1024) {
        $("body").removeClass("rentity-sm-screen");
      } else {
        $("body").addClass("rentity-sm-screen");
      }
    }
    $(window).resize(function () {
      checkForScreenMode();
    });
    checkForScreenMode();
  })();
});
