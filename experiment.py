"""Social learning of spite experiment. Played with one player only + a bot."""

from dallinger.config import get_config
from dallinger.networks import FullyConnected
from dallinger.experiment import Experiment

import json

class Spite(Experiment):
    """Define the structure of the experiment."""

    def __init__(self, session=None):

        super(Spite, self).__init__(session)
        from . import models

        self.models = models
        self.experiment_repeats = 1 # How many networks?
        self.initial_recruitment_size = 1 # How many participants? (note, it is always 1 per group)
        self.known_classes = {
            "Donation": models.Donation,
            "Choice": models.Choice,
            "Condition": models.Condition
        }

        if session:
            self.setup()

    def setup(self):
        """Runs only if there are no networks."""

        if not self.networks():
            super(Spite, self).setup()
            for net in self.networks():
                self.models.Pogtwo(network=net)

    def create_network(self):
        """Return a new network."""
        return FullyConnected(max_size=2) # 1 Pog, 1 Participant

    def create_node(self, participant, network):
        """Create a Probe for the participant"""
        node = self.models.Probe(network=network, participant=participant)
        node.property1 = json.dumps({
            'score_in_pgg' : 0 , 
        })
        return node

    def bonus(self, participant):
        """Calculate a participants bonus."""
        node = participant.nodes()[0]
        return min(round(node.score_in_pgg * 0.005, 2), 1.00)

    def recruit(self):
        """Recruit one participant at a time until all networks are full."""
        if self.networks(full=False):
            self.recruiter.recruit(n=1)
        else:
            self.recruiter.close_recruitment()

    def info_post_request(self, node, info):
        """Depending on the info type, different things will happen here."""
        pog = node.network.nodes(type=self.models.Pogtwo)[0]

        if node.failed:
            raise ValueError("Node {} is failed, it should not be making infos".format(node.id))

        if info.type == "Donation":
            node.transmit(what = info, to_whom = self.models.Pogtwo)[0] 
            pog.receive()

        if info.type == "Condition":
            node.property2 = json.dumps({
            'Condition' : info.contents , 
            })

        if info.type == "Choice": # Placeholder for now. Needs updating once spite mechanics fully decided
            if info.contents == "Yes":
                node.score_in_pgg = node.score_in_pgg - 10
            

