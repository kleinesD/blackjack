$(document).ready(function () {
  const initialDeck = ['2-clubs', '2-diamonds', '2-hearts', '2-spades', '3-clubs', '3-diamonds', '3-hearts', '3-spades', '4-clubs', '4-diamonds', '4-hearts', '4-spades', '5-clubs', '5-diamonds', '5-hearts', '5-spades', '6-clubs', '6-diamonds', '6-hearts', '6-spades', '7-clubs', '7-diamonds', '7-hearts', '7-spades', '8-clubs', '8-diamonds', '8-hearts', '8-spades', '9-clubs', '9-diamonds', '9-hearts', '9-spades', '10-clubs', '10-diamonds', '10-hearts', '10-spades', 'jack-clubs', 'jack-diamonds', 'jack-hearts', 'jack-spades', 'queen-clubs', 'queen-diamonds', 'queen-hearts', 'queen-spades', 'king-clubs', 'king-diamonds', 'king-hearts', 'king-spades', 'ace-clubs', 'ace-diamonds', 'ace-hearts', 'ace-spades',];

  let dealer = {
    cards: []
  }

  let player = {
    cards1: [],
    cards2: [],
    bet: 0,
    money: 1000
  }

  $('#plus-bet').click(function () {
    let bettingStep = 10;

    if (parseFloat($('#bet-amount').attr('data-amount')) + bettingStep > player.money) {
      bettingStep = player.money - parseFloat($('#bet-amount').attr('data-amount'))
    } else {
      bettingStep = 10;
    }

    if (parseFloat($('#bet-amount').attr('data-amount')) < player.money) {
      $('#bet-amount').attr('data-amount', parseFloat($('#bet-amount').attr('data-amount')) + bettingStep);
      $('#bet-amount').text(`BET: ${$('#bet-amount').attr('data-amount')}$`);
    }
  });

  $('#minus-bet').click(function () {
    let bettingStep = 10;

    if (parseFloat($('#bet-amount').attr('data-amount')) - 10 < 10) {
      bettingStep = parseFloat($('#bet-amount').attr('data-amount')) - 10
    } else {
      bettingStep = 10;
    }

    if (parseFloat($('#bet-amount').attr('data-amount')) > 10) {
      $('#bet-amount').attr('data-amount', parseFloat($('#bet-amount').attr('data-amount')) - bettingStep);
      $('#bet-amount').text(`BET: ${$('#bet-amount').attr('data-amount')}$`);
    }
  });

  $('#bet-amount').click(function () {
    player.bet = parseFloat($(this).attr('data-amount'));
    player.money -= player.bet;
    $('#player-money').text(`${player.money}$`)
    $('.bet').text(`${player.bet}$`).css('opacity', '1');
    $('.bet-hide').hide();

    game();
  });

  const serveCard = (currentDeck) => {
    let card;
    let randomNum = Math.floor(Math.random() * (currentDeck.length - 0) + 0);
    card = currentDeck[randomNum];
    currentDeck.splice(randomNum, 1);

    return card;
  }

  const countingCards = (cardsArr, type) => {
    let total = 0;
    /* If there is there is an ACE move it to the end so we can count a soft total */
    cardsArr.forEach((card, index) => {
      if (card.split('-')[0] === 'ace') {
        cardsArr.push(card);
        cardsArr.splice(index, 1);
      }
    });

    /* Counting total */
    cardsArr.forEach((card, index) => {
      let cardNum = card.split('-')[0];
      if (cardNum !== 'jack' && cardNum !== 'queen' && cardNum !== 'king' && cardNum !== 'ace') {
        total += parseFloat(cardNum);
      } else if (cardNum === 'ace') {
        if (index === cardsArr.length - 1) {
          total = total + 11 > 21 ? total + 1 : total + 11;
        } else {
          total += 1;
        }
      } else {
        total += 10;
      }
    });

    if (type === 'player') {
      if (cardsArr.length === 2 && total === 21) {
        finishingGame('player', 'BLACK JACK', 1.5);
      } else if (total > 21) {
        finishingGame('dealer', 'TOO MUCH', 0);
      }
    }
    return total;
  }

  const finishingGame = (whoWon, text, betX) => {
    if (whoWon === 'player') {
      $('.action-end').text(text).show().css('display', 'flex');
      player.money = player.money + player.bet + (player.bet * betX);
    } else if (whoWon === 'dealer') {
      $('.action-end').text(text).show().css('display', 'flex');
    } else if (whoWon === 'draw') {
      $('.action-end').text(text).show().css('display', 'flex');
      player.money = player.money + player.bet;
    }

    $('.action-end').click(function () {
      player.bet = 0;
      player.cards1 = [];
      player.cards2 = [];
      dealer.cards = [];
      $('#player').find('.cards-block').find('img').remove();
      $('#dealer').find('.cards-block').find('img').remove();
      $('.bet').css('opacity', '0');
      $('#player-money').text(`${player.money}$`)
      $('.action-end').hide();

      $('.vote-hide').hide()
      $('.split-hide').hide()
      $('.bet-hide').show().css('display', 'flex');

      $('#hit').off('click');
      $('#stay').off('click');
      $('#split').off('click');

      if (player.money === 0) {
        player.money = 1000
      }
    });


  }

  const dealerCardsCount = (currentDeck, dealerCards, playerCards) => {
    let newDealerCard = serveCard(currentDeck);
    dealerCards.push(newDealerCard);
    $('#dealer').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${newDealerCard}.svg">`)

    window.setTimeout(() => {
      let totalDealer = countingCards(dealerCards, 'dealer');
      let totalPlayer = countingCards(playerCards, 'player');
      if (totalDealer > 21) {
        finishingGame('player', 'PLAYER WIN', 1);
        return;
      } else if (totalDealer <= 21 && totalDealer > totalPlayer) {
        finishingGame('dealer', 'DEALER WIN', 0);
        return;
      } else if (totalDealer === totalPlayer) {
        finishingGame('draw', 'DRAW', 0);
        return;
      } else if (totalDealer < totalPlayer) {
        dealerCardsCount(currentDeck, dealerCards, playerCards);
        return;
      }
    }, 1250);

  };

  const countingCardsForSplit = (cardsArr, elementId) => {
    let total = 0;
    /* If there is there is an ACE move it to the end so we can count a soft total */
    cardsArr.forEach((card, index) => {
      if (card.split('-')[0] === 'ace') {
        cardsArr.push(card);
        cardsArr.splice(index, 1);
      }
    });

    /* Counting total */
    cardsArr.forEach((card, index) => {
      let cardNum = card.split('-')[0];
      if (cardNum !== 'jack' && cardNum !== 'queen' && cardNum !== 'king' && cardNum !== 'ace') {
        total += parseFloat(cardNum);
      } else if (cardNum === 'ace') {
        if (index === cardsArr.length - 1) {
          total = total + 11 > 21 ? total + 1 : total + 11;
        } else {
          total += 1;
        }
      } else {
        total += 10;
      }
    });

    if (elementId) {
      if (total === 21 && cardsArr.length === 2) {
        $(elementId).append(`<div class="end-game-split">BLACK JACK</div>`)
        $(elementId).addClass('cards-black-jack');
      } else if (total > 21) {
        $(elementId).append(`<div class="end-game-split">TOO MUCH</div>`)
        $(elementId).addClass('cards-too-much');
      }
    }

    return total;
  }

  const finishingGameForSplit = (player1Wins, player2Wins, player1BetX, player2BetX) => {
    if (player1Wins) {
      player.money = player.money + (player.bet / 2) + (player.bet / 2 * player1BetX);
    }
    if (player2Wins) {
      player.money = player.money + (player.bet / 2) + (player.bet / 2 * player2BetX);
    }

    if (player1Wins && player2Wins) {
      $('.action-end').text('PLAYER WINS!').show().css('display', 'flex');
    } else if (player1Wins && !player2Wins || !player1Wins && player2Wins) {
      $('.action-end').text('DRAW!').show().css('display', 'flex');
    } else if (!player1Wins && !player2Wins) {
      $('.action-end').text('DEALER WINS!').show().css('display', 'flex');
    }

    $('.action-end').click(function () {
      player.bet = 0;
      player.cards1 = [];
      player.cards2 = [];
      dealer.cards = [];
      $('#dealer').find('.cards-block').find('img').remove();
      $('#player').find('.cards-block').remove();
      $('#player').find('.all-cards-block').append(`<div class="cards-block">
      <div class="bet">0$</div>
      </div>`);

      $('.bet').css('opacity', '0');
      $('#player-money').text(`${player.money}$`)
      $('.action-end').hide();

      $('.vote-hide').hide()
      $('.split-hide').hide()
      $('.bet-hide').show().css('display', 'flex');

      $('#hit').off('click');
      $('#stay').off('click');
      $('#split').off('click');

      if (player.money === 0) {
        player.money = 1000
      }
    });
  }

  const dealersCardsCountForSplit = (currentDeck, dealerCards, playerCards1, playerCards2) => {
    if(!$('#cards1').hasClass('cards-too-much') || !$('#cards2').hasClass('cards-too-much')) {
      let newDealerCard = serveCard(currentDeck);
      dealerCards.push(newDealerCard);
      $('#dealer').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${newDealerCard}.svg">`)
    }

    window.setTimeout(() => {
      let totalDealer = countingCardsForSplit(dealerCards);
      let totalPlayer1 = countingCardsForSplit(playerCards1);
      let totalPlayer2 = countingCardsForSplit(playerCards2);
      let lowestTotal = totalPlayer1 < totalPlayer2 ? totalPlayer1 : totalPlayer2;

      let player1Wins = false;
      let player2Wins = false;
      let player1BetX = 1;
      let player2BetX = 1;
      if ($('#cards1').hasClass('cards-black-jack')) { player1Wins = true; player1BetX = 1.5 }
      if ($('#cards2').hasClass('cards-black-jack')) { player2Wins = true; player2BetX = 1.5 }
      if ($('#cards1').hasClass('cards-too-much')) { player1Wins = false; player1BetX = 0 }
      if ($('#cards2').hasClass('cards-too-much')) { player2Wins = false; player2BetX = 0 }

      if (totalDealer > 21 && totalPlayer1 <= 21) { player1Wins = true; }
      if (totalDealer > 21 && totalPlayer2 <= 21) { player2Wins = true; }

      if (totalDealer < totalPlayer1 && totalPlayer1 <= 21) { player1Wins = true; }
      if (totalDealer < totalPlayer2 && totalPlayer2 <= 21) { player2Wins = true; }

      if (totalDealer < lowestTotal && lowestTotal <= 21) {
        dealersCardsCountForSplit(currentDeck, dealerCards, playerCards1, playerCards2);
      } else {
        finishingGameForSplit(player1Wins, player2Wins, player1BetX, player2BetX);
      }



    }, 1250);
  }

  const game = () => {
    let currentDeck = initialDeck;
    let randomNumForId = Math.floor(Math.random() * (1000 - 0) + 0);


    /* Shuffle the deck */
    player.cards1.push(serveCard(currentDeck));
    dealer.cards.push(serveCard(currentDeck));
    player.cards1.push(serveCard(currentDeck));


    $('#player').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[0]}.svg">`)
    $('#player').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[1]}.svg">`)
    $('#dealer').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${dealer.cards[0]}.svg">`)

    countingCards(player.cards1, 'player');

    if (player.cards1[0].split('-')[0] === player.cards1[1].split('-')[0]) {
      $('.split-hide').show().css('display', 'flex');
    }

    $('.vote-hide').show().css('display', 'flex');

    $('#hit').click(function () {
      $('.split-hide').hide()
      player.cards1.push(serveCard(currentDeck));
      $('#player').find('.cards-block').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[player.cards1.length - 1]}.svg">`);

      countingCards(player.cards1, 'player');
    });

    $('#stay').click(function () {
      $('.vote-hide').hide()
      $('.split-hide').hide()

      dealerCardsCount(currentDeck, dealer.cards, player.cards1)
    });

    /* SPLIT functions */

    $('#split').click(function () {
      $('#hit').off('click');
      $('#stay').off('click');
      $(this).hide();
      player.money -= player.bet;
      player.bet *= 2;
      player.cards2.push(player.cards1[1]);
      player.cards1.pop(player.cards1[1]);
      player.cards1.push(serveCard(currentDeck))
      player.cards2.push(serveCard(currentDeck))
      $('#player').find('.cards-block').remove();

      /* <div class="end-game-split">DEALER WIN</div> */
      $('#player').find('.all-cards-block').append(`<div class="cards-block current-cards-block" id="cards1">
      <div class="bet">${player.bet / 2}$</div>
      <img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[0]}.svg">
      <img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[1]}.svg">
      </div>`);
      $('#player').find('.all-cards-block').append(`<div class="cards-block" id="cards2">
      <div class="bet">${player.bet / 2}$</div>
      <img src="https://kleinesd.github.io/blackjack/card-images/${player.cards2[0]}.svg">
      <img src="https://kleinesd.github.io/blackjack/card-images/${player.cards2[1]}.svg">
      </div>`);
      $('.bet').css('opacity', '1');
      $('.money').text(`${player.money}$`)

      countingCardsForSplit(player.cards1, '#cards1');
      countingCardsForSplit(player.cards2, '#cards2');

      if ($('#cards1').hasClass('cards-black-jack') && $('#cards2').hasClass('cards-black-jack')) {
        /* Couting cards for dealer right away */
      } else if ($('#cards1').hasClass('cards-black-jack')) {
        $('#cards1').removeClass('current-cards-block');
        $('#cards2').addClass('current-cards-block');
      }

      $('#hit').click(function () {
        if ($('.current-cards-block').attr('id') === 'cards1') {
          player.cards1.push(serveCard(currentDeck));
          $('#cards1').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${player.cards1[player.cards1.length - 1]}.svg">`);

          let total = countingCardsForSplit(player.cards1, '#cards1');

          if (total > 21) {
            $('#stay').trigger('click');
          }

        } else if ($('.current-cards-block').attr('id') === 'cards2') {
          player.cards2.push(serveCard(currentDeck));
          $('#cards2').append(`<img src="https://kleinesd.github.io/blackjack/card-images/${player.cards2[player.cards2.length - 1]}.svg">`);

          let total = countingCardsForSplit(player.cards2, '#cards2');

          if (total > 21) {
            $('#stay').trigger('click');
          }
        }
      });

      $('#stay').click(function () {
        if ($('.current-cards-block').attr('id') === 'cards1') {
          if ($('#cards2').hasClass('cards-black-jack')) {
            $('#cards1').removeClass('current-cards-block');
            dealersCardsCountForSplit(currentDeck, dealer.cards, player.cards1, player.cards2);
            /* Go to dealer count right away */
          } else {
            $('#cards1').removeClass('current-cards-block');
            $('#cards2').addClass('current-cards-block');
          }
        } else if ($('.current-cards-block').attr('id') === 'cards2') {
          $('#cards2').removeClass('current-cards-block');
          /* Go to dealer count right away */
          dealersCardsCountForSplit(currentDeck, dealer.cards, player.cards1, player.cards2);
        }
      });

    });


    return false;
  }

});