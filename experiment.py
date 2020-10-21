"""Social learning of spite experiment. Played with one player only + a bot."""

from dallinger.config import get_config
from dallinger.networks import FullyConnected
from dallinger.experiment import Experiment

import json

class Spite(Experiment):
    """Define the structure of the experiment."""

    def __init__(self, session=None):

        super(Spite, self).__init__(session)
        from . import models  # Import at runtime to avoid SQLAlchemy warnings

        self.models = models
        self.experiment_repeats = 1 # How many networks?
        self.initial_recruitment_size = 1 # How many participants? (note, it is always 1 per group)

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

    def add_node_to_network(self, node, network):
        """Add node to the chain and receive transmissions."""
        network.add_node(node)

    def recruit(self):
        """Recruit one participant at a time until all networks are full."""
        if self.networks(full=False):
            self.recruiter.recruit(n=1)
        else:
            self.recruiter.close_recruitment()

    def info_post_request(self, node, info):
        """Depending on the info type, different things will happen here."""

        if node.failed:
            raise ValueError("Node {} is failed, it should not be making infos".format(node.id))

        if info(type=self.models.Donation):
            node.transmit(what = info, to_whom = self.models.PogTwo) # Send it to the POG

